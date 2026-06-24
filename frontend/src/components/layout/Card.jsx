import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";

export default function Cardstat({ head, texte }) {
  return (
    <Card className="w-64 border border-black-900 rounded-md shadow-none overflow-hidden">
      {/* Titre */}
      <CardHeader
        floated={false}
        shadow={false}
        className="m-0 p-3 rounded-none border-b border-black-900 bg-transparent"
      >
        <Typography
          variant="h5"
          className="text-black-1000 font-bold text-center"
        >
          {head}
        </Typography>
      </CardHeader>
      {/* Texte */}
      <CardBody className="p-6 flex justify-center items-center">
        <Typography className="text-2xl font-bold text-blue-900">
          {texte}
        </Typography>
      </CardBody>
    </Card>
  );
}
