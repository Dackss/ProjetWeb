export default function Cardstat({ head, texte }) {
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="p-3 border-b border-gray-300 bg-gray-50">
        <p className="font-bold text-center text-gray-800">{head}</p>
      </div>
      <div className="p-6 flex justify-center items-center">
        <p className="text-2xl font-bold text-blue-900">{texte}</p>
      </div>
    </div>
  );
}
