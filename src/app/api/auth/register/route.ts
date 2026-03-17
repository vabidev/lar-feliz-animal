diff --git a/src/app/api/auth/register/route.ts b/src/app/api/auth/register/route.ts
index 577b12a103f92f30fe7c9b69e99a6f7e682479df..f4055e3ed21f2bf9f0b058b16f416273eb09fa22 100644
--- a/src/app/api/auth/register/route.ts
+++ b/src/app/api/auth/register/route.ts
@@ -1,58 +1,72 @@
 import { NextResponse } from 'next/server';
 import { initializeFirebase } from '@/firebase';
-import { collection, doc, getDoc, getDocs, query, where, setDoc, Timestamp } from 'firebase/firestore';
-import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
+import { collection, doc, getDocs, query, where, setDoc, Timestamp } from 'firebase/firestore';
+import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
 
 // Coleção para registrar tentativas por IP
 const REG_COLLECTION = 'registrationAttempts';
 
 export async function POST(request: Request) {
   try {
     const { email, password, name } = await request.json();
     if (!email || !password || !name) {
       return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
     }
 
     const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || (request as any).ip || 'unknown';
     const { firestore, auth } = initializeFirebase();
-    if (!firestore || !auth) {
-      return NextResponse.json({ error: 'Firebase não inicializado.' }, { status: 500 });
+    if (!auth) {
+      return NextResponse.json({ error: 'Firebase Auth não inicializado.' }, { status: 500 });
     }
 
-    // Verificar se já existe tentativa hoje para este IP
-    const today = new Date();
-    today.setHours(0, 0, 0, 0);
-    const tomorrow = new Date(today);
-    tomorrow.setDate(today.getDate() + 1);
-    const attemptsRef = collection(firestore, REG_COLLECTION);
-    const q = query(
-      attemptsRef,
-      where('ip', '==', ip),
-      where('createdAt', '>=', Timestamp.fromDate(today)),
-      where('createdAt', '<', Timestamp.fromDate(tomorrow))
-    );
-    const snapshot = await getDocs(q);
-    if (!snapshot.empty) {
-      return NextResponse.json({ error: 'Limite de criação de conta por IP atingido. Tente amanhã.' }, { status: 429 });
+    const attemptsRef = firestore ? collection(firestore, REG_COLLECTION) : null;
+
+    // Verificar limite de tentativas por IP (best effort).
+    if (attemptsRef) {
+      try {
+        const today = new Date();
+        today.setHours(0, 0, 0, 0);
+        const tomorrow = new Date(today);
+        tomorrow.setDate(today.getDate() + 1);
+
+        const q = query(
+          attemptsRef,
+          where('ip', '==', ip),
+          where('createdAt', '>=', Timestamp.fromDate(today)),
+          where('createdAt', '<', Timestamp.fromDate(tomorrow))
+        );
+        const snapshot = await getDocs(q);
+        if (!snapshot.empty) {
+          return NextResponse.json({ error: 'Limite de criação de conta por IP atingido. Tente amanhã.' }, { status: 429 });
+        }
+      } catch (attemptCheckError) {
+        console.warn('Não foi possível validar limite de cadastro por IP. Prosseguindo sem essa validação.', attemptCheckError);
+      }
     }
 
     const credential = await createUserWithEmailAndPassword(auth, email, password);
     await updateProfile(credential.user, { displayName: name });
 
     const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000';
     await sendEmailVerification(credential.user, { url: `${appOrigin}/verify-email`, handleCodeInApp: true });
 
-    // Registrar tentativa
-    const attemptDoc = doc(attemptsRef);
-    await setDoc(attemptDoc, {
-      ip,
-      uid: credential.user.uid,
-      createdAt: Timestamp.now(),
-    });
+    // Registrar tentativa (best effort).
+    if (attemptsRef) {
+      try {
+        const attemptDoc = doc(attemptsRef);
+        await setDoc(attemptDoc, {
+          ip,
+          uid: credential.user.uid,
+          createdAt: Timestamp.now(),
+        });
+      } catch (attemptSaveError) {
+        console.warn('Não foi possível registrar tentativa de cadastro.', attemptSaveError);
+      }
+    }
 
     return NextResponse.json({ success: true });
   } catch (error: any) {
     console.error('Erro no registro', error);
     return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
   }
 }
