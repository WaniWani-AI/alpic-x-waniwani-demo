import "@/index.css";

import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers.js";

function ShowSkiLessonConfirmation() {
  const { output } = useToolInfo<"show-ski-lesson-confirmation">();

  if(!output) {
    return <div>Confirming ski lesson...</div>;
  }

  return (
    <div className="container">
      <div className="ski-lesson-confirmation">
        <div className="level">{output.level}</div>
        <div className="date">{output.date}</div>
        <div className="time">{output.time}</div>
        <div className="notes">{output.notes}</div>
      </div>
    </div>
  );
}

export default ShowSkiLessonConfirmation;

mountWidget(<ShowSkiLessonConfirmation />);
