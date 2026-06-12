import HistorialViewNew from './historial/HistorialView.jsx';
import { useToast } from './Toast.jsx';

export default function HistorialView({ reportes, openReport, deleteReport, loading, onGenerar, onDuplicateReport }) {
  return (
    <HistorialViewNew
      reportes={reportes}
      loading={loading}
      onGenerar={onGenerar}
      openReport={openReport}
      deleteReport={deleteReport}
      onDuplicateReport={onDuplicateReport}
      useToastHook={useToast}
    />
  );
}
