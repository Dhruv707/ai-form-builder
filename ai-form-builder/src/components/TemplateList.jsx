import TemplateCard from "./TemplateCard.jsx";

export default function TemplateList({ templates = [], onSelect = () => {} }) {
  return (
    <div className="templates-list">
      {templates.map((tpl) => (
        <TemplateCard
          key={tpl.id}
          title={tpl.title}
          description={tpl.description}
          onOpen={() => onSelect(tpl.id)}
        />
      ))}
    </div>
  );
}