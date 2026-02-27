"use client";
import React, { useState } from "react";
import { useDoctor } from "@/ContextApi/doctorContext";
import LabelForm from "@/Components/Form/LabelForm";
import Input from "@/Components/ui/Input";
import Button from "@/Components/ui/Button";
import VerticalContainer from "@/Components/ui/Container/VerticalContainer";
import HorizontalContainer from "@/Components/ui/Container/HorizontalContainer";
import Image  from "@/Components/ui/Image";
import Modal from "@/Components/ui/Modal";

export default function DoctorProfile() {
  const { doctor, updateDoctor } = useDoctor();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoctor, setEditedDoctor] = useState(doctor);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateDoctor(editedDoctor);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="relative">
        <Image
          src="https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"
          alt="Banner"
          width={1600}
          height={400}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Image
            src={doctor.doctorImage || "https://via.placeholder.com/150"}
            alt="Doctor"
            width={150}
            height={150}
            className="rounded-full border-4 border-white"
          />
        </div>
      </div>

      <div className="mt-24 text-center">
        <h1 className="text-3xl font-bold">{doctor.doctorName}</h1>
        <p className="text-gray-600">{doctor.specialist}</p>
        <p className="text-gray-500 text-sm">{doctor.doctorDegree}</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctor.stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white p-4 rounded-lg shadow-md text-center"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Doctor Name</p>
                <p>{doctor.doctorName}</p>
              </div>
              <div>
                <p className="font-semibold">Specialization</p>
                <p>{doctor.specialist}</p>
              </div>
              <div>
                <p className="font-semibold">Degree</p>
                <p>{doctor.doctorDegree}</p>
              </div>
              <div>
                <p className="font-semibold">Clinic Location</p>
                <p>{doctor.clinicLocation}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <VerticalContainer>
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <LabelForm label="Doctor Name">
            <Input
              name="doctorName"
              value={editedDoctor.doctorName}
              onChange={handleInputChange}
            />
          </LabelForm>
          <LabelForm label="Specialization">
            <Input
              name="specialist"
              value={editedDoctor.specialist}
              onChange={handleInputChange}
            />
          </LabelForm>
          <LabelForm label="Degree">
            <Input
              name="doctorDegree"
              value={editedDoctor.doctorDegree}
              onChange={handleInputChange}
            />
          </LabelForm>
          <LabelForm label="Clinic Location">
            <Input
              name="clinicLocation"
              value={editedDoctor.clinicLocation}
              onChange={handleInputChange}
            />
          </LabelForm>
          <HorizontalContainer>
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={() => setIsEditing(false)} variant="secondary">
              Cancel
            </Button>
          </HorizontalContainer>
        </VerticalContainer>
      </Modal>
    </div>
  );
}
