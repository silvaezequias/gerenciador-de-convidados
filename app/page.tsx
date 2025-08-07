"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Settings, Trash2, AlertTriangle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Person {
  id: string;
  name: string;
  age: number;
}

export default function PeopleTableManager() {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [baseAge, setBaseAge] = useState(13);
  const [tempBaseAge, setTempBaseAge] = useState(13);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [peopleToTransfer, setPeopleToTransfer] = useState<Person[]>([]);

  const addPerson = () => {
    if (name.trim() && age) {
      const personAge = age === `${baseAge}+` ? baseAge : parseInt(age);
      const newPerson: Person = {
        id: Date.now().toString(),
        name: name.trim(),
        age: personAge,
      };
      setPeople([...people, newPerson]);
      setName("");
      setAge("");
    }
  };

  const setAdultAge = () => {
    setAge(`${baseAge}+`);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter((person) => person.id !== id));
  };

  const adults = people.filter((person) => person.age >= baseAge);
  const children = people.filter((person) => person.age < baseAge);

  const generatePDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const currentDate = `${day}/${month}/${year}`;
    const fileName = `Tabela de Convidados ${day}-${month}-${year}`;

    doc.setFontSize(10);
    doc.text(`Data: ${currentDate}`, 20, 15);

    doc.setFontSize(20);
    doc.text("Tabela de Pessoas", 20, 30);

    doc.setFontSize(14);
    doc.text(`Total de pessoas: ${people.length}`, 20, 45);
    doc.text(
      `Adultos: ${adults.length} | Crianças: ${children.length}`,
      20,
      55
    );

    let yPosition = 75;

    if (adults.length > 0) {
      doc.setFontSize(16);
      doc.text("Adultos", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Nome", 25, yPosition);
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      doc.setFont("helvetica", "normal");
      adults.forEach((person, index) => {
        doc.text(`${index + 1}. ${person.name}`, 25, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    if (children.length > 0) {
      doc.setFontSize(16);
      doc.text("Crianças", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Nome", 25, yPosition);
      doc.text("Idade", 120, yPosition);
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      doc.setFont("helvetica", "normal");
      children.forEach((child, index) => {
        doc.text(`${index + 1}. ${child.name}`, 25, yPosition);
        doc.text(
          `${child.age} ${child.age === 1 ? "ano" : "anos"}`,
          120,
          yPosition
        );
        yPosition += 8;
      });
    }

    doc.save(`${fileName}.pdf`);
  };

  const updateBaseAge = () => {
    const currentAdults = people.filter((person) => person.age >= baseAge);
    const peopleNeedingTransfer = currentAdults.filter(
      (person) => person.age < tempBaseAge
    );

    if (peopleNeedingTransfer.length > 0) {
      setPeopleToTransfer(peopleNeedingTransfer);
      setShowTransferDialog(true);
    } else {
      setBaseAge(tempBaseAge);
    }
  };

  const confirmTransfer = (transfer: boolean) => {
    setBaseAge(tempBaseAge);
    setShowTransferDialog(false);
    setPeopleToTransfer([]);

    if (transfer) {
      // TODO: Teransferir pessoas se permitido
      // Vou adicionar isso amanhã gaby bb te amo
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Gerenciador de Convidados
        </h1>
        <p className="text-center text-muted-foreground">
          Organize convidados por faixa etária
        </p>
      </div>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Transferir Pessoas?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A nova idade base ({tempBaseAge} anos) fará com que{" "}
                {peopleToTransfer.length} pessoa(s) seja(m) transferida(s) da
                lista &quot;Adultos&quot; para &quot;Crianças&quot;:
              </AlertDescription>
            </Alert>
            <div className="bg-muted p-4 rounded-lg">
              <ul className="space-y-2">
                {peopleToTransfer.map((person) => (
                  <li key={person.id} className="flex justify-between">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {person.age} anos
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Deseja aplicar a nova idade base e transferir essas pessoas?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => confirmTransfer(false)}>
              Aplicar sem transferir
            </Button>
            <Button onClick={() => confirmTransfer(true)}>
              Aplicar e transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Pessoa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome da pessoa"
                />
              </div>
              <div>
                <Label htmlFor="age">Idade</Label>
                <div className="flex gap-2">
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a idade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: baseAge + 1 }, (_, i) => i).map(
                        (ageOption) => (
                          <SelectItem
                            key={ageOption}
                            value={ageOption.toString()}
                          >
                            {ageOption} {ageOption === 1 ? "ano" : "anos"}
                          </SelectItem>
                        )
                      )}
                      <SelectItem value={`${baseAge}+`}>
                        {baseAge}+ anos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={setAdultAge}
                    className="flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="h-3 w-3" />
                    {baseAge}
                  </Button>
                </div>
              </div>
              <Button
                onClick={addPerson}
                disabled={!name.trim() || !age}
                className="w-full"
              >
                Adicionar Pessoa
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="baseAge">Idade base (anos)</Label>
                <Input
                  id="baseAge"
                  type="number"
                  value={tempBaseAge}
                  onChange={(e) =>
                    setTempBaseAge(parseInt(e.target.value) || 13)
                  }
                  className="w-full"
                  min="1"
                  max="100"
                />
              </div>
              <Button
                onClick={updateBaseAge}
                variant="outline"
                className="w-full"
              >
                Aplicar Configuração
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Pessoas com {baseAge}+ anos são consideradas adultos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Adultos ({baseAge}+ anos)
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({adults.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 min-h-[200px]">
              {adults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum adulto adicionado
                </p>
              ) : (
                adults.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{person.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerson(person.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Crianças (0-{baseAge - 1} anos)
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({children.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 min-h-[200px]">
              {children.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma criança adicionada
                </p>
              ) : (
                children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">{child.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {child.age} {child.age === 1 ? "ano" : "anos"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePerson(child.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {people.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {adults.length}
                </div>
                <div className="text-sm text-muted-foreground">Adultos</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {children.length}
                </div>
                <div className="text-sm text-muted-foreground">Crianças</div>
              </div>
            </div>

            <Button
              onClick={generatePDF}
              disabled={people.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
