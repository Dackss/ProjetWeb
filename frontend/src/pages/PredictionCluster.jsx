import { TabSelect } from "../components/layout/Tableselect";
import { ButtonsNavigation } from "../components/layout/bottonpredicte";
import { PredictionForm } from "../components/layout/formcluster";
function PredictionCluster() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center pb-10">Prédiction</h1>
      <TabSelect />
      <ButtonsNavigation />
      <h1 className="text-2xl font-bold text-center pt-10 pb-10">Cluster</h1>
      <PredictionForm />
    </div>
  );
}

export default PredictionCluster;
