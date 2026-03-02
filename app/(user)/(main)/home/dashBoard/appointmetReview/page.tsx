import AppointmentStatus from "@/Screen/user/main/AppointmentReview"
import { Suspense } from "react"
export default function AppointmentStatusPage(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
 <AppointmentStatus/>
        </Suspense>
    )
    
};
