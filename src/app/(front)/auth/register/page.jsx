import React from 'react'
import { RegisterForm } from '../../../../../components/front/home/forms/RegisterForm'
import { createClient } from "../../../../lib/supabase/server"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, clinic_id")
    .eq("user_id", user.id);

  const isAdmin = memberships?.some(m => m.role === "admin");

  if (!isAdmin) {
    redirect("/select_clinic");
  }

  return <RegisterForm />;
}