import { useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";

export function PredictionForm() {
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [erreur, setErreur] = useState("");

  const handlePredictionSubmit = (event) => {
    event.preventDefault();

    if (!longitude || !latitude) {
      setErreur("Veuillez remplir tous les champs !");
      return;
    }

    setErreur("");

    console.log("Données :", {
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
    });

    // TODO : ici, on appellera l'API pour récupérer la prédiction du cluster
  };

  return (
    <section className="w-full p-4">
      <Card className="w-full border border-gray-300 bg-white p-6 rounded-xl shadow-sm">
        {/* Formulaire en ligne */}
        <form
          onSubmit={handlePredictionSubmit}
          className="flex flex-col md:flex-row items-end gap-4 w-full"
        >
          {/* Champ Longitude */}
          <div className="w-full md:flex-1">
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-bold"
            >
              Longitude
            </Typography>
            <Input
              type="number"
              step="any"
              size="lg"
              placeholder="Ex: 2.3522"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          {/* Champ Latitude */}
          <div className="w-full md:flex-1">
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 font-bold"
            >
              Latitude
            </Typography>
            <Input
              type="number"
              step="any"
              size="lg"
              placeholder="Ex: 48.8566"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          {/* Bouton de Soumission */}
          <div className="w-full md:w-auto">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-colors h-[44px] flex items-center justify-center whitespace-nowrap"
              fullWidth
            >
              Prediction cluster
            </Button>
          </div>
        </form>

        {/* Message d'erreur affiché si les champs sont vides */}
        {erreur && (
          <Typography color="red" className="mt-3 text-sm font-medium">
            {erreur}
          </Typography>
        )}
      </Card>
    </section>
  );
}
