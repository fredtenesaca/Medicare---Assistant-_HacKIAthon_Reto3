import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { PatientsTable } from "@/components/patients/patients-table";
import { patients } from "@/lib/mock-data";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Gestión centralizada</p>
          <h2 className="text-2xl font-semibold tracking-tight">Pacientes</h2>
        </div>
        <PatientFormDialog />
      </section>
      <PatientsTable patients={patients} />
    </div>
  );
}
