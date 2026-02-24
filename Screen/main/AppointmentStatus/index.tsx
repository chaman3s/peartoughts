export default function AppointmentStatus() {
    return(
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
              <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6">
                <DoctorHeader
                  status={"Available Today"}
                  doctorName={"Dr. Kumar Das"}
                  specialist={"Ophthalmologist"}
                  doctorDegree={"MBBS, MS (Surgeon)"}
                  clinicLocation={"Fellow of Sanskar Netralaya, Chennai"}
                  doctorImage={"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg"}
                  stats={stats}
                />
            </section>
        </main>
    )
};
