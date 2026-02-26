"use client";
import React, { useState } from "react";
import { useDoctor } from "@/ContextApi/doctorContext";
import LabelForm from "@/Components/Form/LabelForm";
import Input from "@/Components/ui/Input";
import Button from "@/Components/ui/Button";
import VerticalContainer from "@/Components/ui/Container/VerticalContainer";
import HorizontalContainer from "@/Components/ui/Container/HorizontalContainer";

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
    <VerticalContainer>
      <h1 className="text-2xl font-bold mb-4">Doctor Profile</h1>
      {isEditing ? (
        <VerticalContainer>
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
      ) : (
        <VerticalContainer>
          <p>
            <strong>Doctor Name:</strong> {doctor.doctorName}
          </p>
          <p>
            <strong>Specialization:</strong> {doctor.specialist}
          </p>
          <p>
            <strong>Degree:</strong> {doctor.doctorDegree}
          </p>
          <p>
            <strong>Clinic Location:</strong> {doctor.clinicLocation}
          </p>
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </VerticalContainer>
      )}
    </VerticalContainer>
  );
}
