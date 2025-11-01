import { useParams } from "react-router-dom";
import { getEventById } from "@/lib/eras";
import { AnalysisView } from "@/components/AnalysisView";

const EventPage = () => {
  const { eventId } = useParams();
  const match = getEventById(eventId || "");
  const title = match?.event?.title || "Historical Event";

  return (
    <div>
      <AnalysisView source={{ mode: "search", value: title }} />
    </div>
  );
};

export default EventPage;


