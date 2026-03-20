import {supabase} from "../supabase/client"

export async function getPatient(){
    const {data,error} = await supabase
    .from("patients")
    .select("*")

    if(error) throw error
    return data
}