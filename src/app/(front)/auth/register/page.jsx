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

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("id", user.id)
    .single();

  if (membership?.role !== "admin") {
    redirect("/dashboard");
  }

  return <RegisterForm />;
}