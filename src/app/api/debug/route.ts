import { NextResponse } from "next/server";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "complaints"));
    const complaints = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ complaints });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
