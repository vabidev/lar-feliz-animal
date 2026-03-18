import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export const runtime = 'nodejs';

// Coleção para registrar tentativas por IP
const REG_COLLECTION = 'registrationAttempts';

function getFirebaseServices() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return { auth: null, firestore: null };
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

export async function POST(request: Request) {
  try {
    const {
