import { appointments } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateFormatter } from "@/lib/utils";

const statusVariant = {
  Confirmada: "emerald",
  Pendiente: "amber",
  Cancelada: "rose",
  Completada: "secondary",
} as const;

export function AppointmentsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda Médica</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <p className="font-medium">{appointment.patient}</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                </TableCell>
                <TableCell>{appointment.specialty}</TableCell>
                <TableCell className="tabular">
                  {dateFormatter.format(new Date(appointment.date))} · {appointment.time}
                </TableCell>
                <TableCell>{appointment.mode}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" type="button" variant="outline">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
