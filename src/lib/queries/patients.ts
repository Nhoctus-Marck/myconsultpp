import { createClient } from "../supabase/client";
const supabase = createClient(); 

export async function getPatient(){
    const {data,error} = await supabase
    .from("patients")
    .select("*")

    if(error) throw error
    return data
}