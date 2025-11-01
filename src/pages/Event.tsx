import { useParams } from "react-router-dom";
import { getEventById } from "@/lib/eras";
import { AnalysisView } from "@/components/AnalysisView";
import HistorianAgent from "@/components/HistorianAgent";

const EventPage = () => {
  const { eventId } = useParams();
  const match = getEventById(eventId || "");
  const title = match?.event?.title || "Historical Event";
  const year = match?.event?.year || "";
  const summary = match?.event?.preview || "";

  return (
    <div>
      {match && (
        <HistorianAgent context={{ title, year, summary }} />
      )}
      <AnalysisView source={{ mode: "search", value: title }} />
    </div>
  );
};

export default EventPage;


