import { useCallback, useEffect, useRef, useState } from 'react';
import { getSchema } from '../config/feAlegriaSchemas.js';
import { fillTemplate, downloadDocxBlob, printDocxBlob } from '../utils/docxExporter.js';
import { renderDocxBlob } from '../utils/feaRender.js';
import { fitDocxToWidth } from '../utils/docxPreviewFit.js';
import { useToast } from './Toast.jsx';
import FormatoPreviewModal from './FormatoPreviewModal.jsx';
import './FeAlegriaReportView.css';

function ScalarField({ field, value, onChange, disabled }) {
  return (
    <label className="fea-field">
      <span className="fea-field__label">{field.label}</span>
      {field.ai ? (
        <textarea
          className="fea-field__input fea-field__textarea"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={Math.min(8, Math.max(3, String(value ?? '').split('\n').length + 1))}
        />
      ) : (
        <input
          className="fea-field__input"
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </label>
  );
}

function ArrayEditor({ arrayDef, items, onChange, disabled }) {
  const updateItem = (idx, key, val) => {
    const next = items.map((row, i) => (i === idx ? { ...row, [key]: val } : row));
    onChange(next);
  };
  const addRow = () => {
    const blank = Object.fromEntries(arrayDef.itemFields.map(f => [f.key, '']));
    onChange([...(items || []), blank]);
  };
  const removeRow = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="fea-array">
      <div className="fea-array__head">
        <span className="fea-array__title">{arrayDef.label}</span>
        <button type="button" className="btn btn-ghost fea-array__add" onClick={addRow} disabled={disabled}>+ Fila</button>
      </div>
      {(items || []).map((row, idx) => (
        <div key={idx} className="fea-array__row">
          {arrayDef.itemFields.map(f => (
            <label key={f.key} className="fea-field fea-field--inline">
              <span className="fea-field__label">{f.label}</span>
              <textarea
                className="fea-field__input fea-field__textarea"
                value={row[f.key] ?? ''}
                onChange={(e) => updateItem(idx, f.key, e.target.value)}
                disabled={disabled}
                rows={2}
              />
            </label>
          ))}
          <button type="button" className="fea-array__remove" onClick={() => removeRow(idx)} disabled={disabled} aria-label="Eliminar fila">×</button>
        </div>
      ))}
    </div>
  );
}

export default function FeAlegriaReportView({
  reportType, form, fileName, data: initialData, streaming,
  reset, onSaveEdits, onDataChange, reporteId, feedbackInicial,
  copied, copyReport,
}) {
  const toast = useToast();
  const [data, setData] = useState(initialData);
  const [docxBlob, setDocxBlob] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFormatoPreview, setShowFormatoPreview] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [containFallback, setContainFallback] = useState(false);
  const paneRef = useRef(null);
  const scaleWrapRef = useRef(null);
  const previewRef = useRef(null);
  const styleRef = useRef(null);
  const debounceRef = useRef(null);

  const computeFit = useCallback(() => {
    const wrap = scaleWrapRef.current;
    const pane = paneRef.current;
    if (!wrap || !pane) return;
    const fit = fitDocxToWidth(wrap, pane);
    if (fit == null) { setContainFallback(true); return; }
    setContainFallback(false);
    setZoom(Number(fit.toFixed(3)));
  }, []);

  const schema = getSchema(reportType);

  useEffect(() => { setData(initialData); }, [initialData]);

  const refreshPreview = useCallback(async (payload) => {
    if (!previewRef.current || streaming) return;
    setPreviewLoading(true);
    try {
      const blob = await fillTemplate(reportType, payload, form);
      setDocxBlob(blob);
      await renderDocxBlob(previewRef.current, styleRef.current, blob);
      requestAnimationFrame(() => computeFit());
      setTimeout(() => computeFit(), 180);
    } catch {
      toast.error('No se pudo renderizar la vista previa del documento.');
    } finally {
      setPreviewLoading(false);
    }
  }, [reportType, form, streaming, toast, computeFit]);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const ro = new ResizeObserver(() => computeFit());
    ro.observe(pane);
    const onResize = () => computeFit();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [computeFit]);

  useEffect(() => {
    if (streaming || !data) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => refreshPreview(data), 450);
    return () => clearTimeout(debounceRef.current);
  }, [data, streaming, refreshPreview]);

  const patchData = (patch) => {
    const next = { ...data, ...patch };
    setData(next);
    onDataChange?.(next);
  };

  const handleSave = async () => {
    if (onSaveEdits) await onSaveEdits(data);
    toast.success('Cambios guardados');
  };

  const handleWord = async () => {
    setExporting(true);
    try {
      const blob = docxBlob ?? await fillTemplate(reportType, data, form);
      downloadDocxBlob(blob, fileName);
    } catch {
      toast.error('No se pudo exportar Word.');
    } finally {
      setExporting(false);
    }
  };

  const handlePdf = async () => {
    setExporting(true);
    try {
      const blob = docxBlob ?? await fillTemplate(reportType, data, form);
      await printDocxBlob(blob, fileName);
    } catch {
      toast.error('No se pudo generar PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (!schema) return null;

  return (
    <div className="fea-report-view">
      <FormatoPreviewModal open={showFormatoPreview} onClose={() => setShowFormatoPreview(false)} initialType={reportType} />

      <div className="fea-report-header">
        <div>
          <h2 className="report-title">{streaming ? 'Generando documento…' : 'Documento Fe y Alegría'}</h2>
          <p className="report-meta">{form.curso} · {form.periodo}</p>
        </div>
        <div className="report-header__actions">
          {!streaming && (
            <button type="button" className="btn btn-ghost" onClick={() => setShowFormatoPreview(true)} style={{ fontSize: 13 }}>
              👁 Ver formato oficial
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={streaming} style={{ fontSize: 13 }}>Nuevo reporte</button>
        </div>
      </div>

      <div className="fea-dl-bar">
        <button type="button" className="dl-btn" onClick={handleWord} disabled={streaming || exporting}>{exporting ? 'Exportando…' : 'Word (.docx)'}</button>
        <button type="button" className="dl-btn" onClick={handlePdf} disabled={streaming || exporting}>PDF (imprimir)</button>
      </div>

      <p className="fea-hint">La vista previa coincide con el Word descargado. Edita los campos a la derecha.</p>

      <div className="fea-split">
        <div ref={paneRef} className={`fea-preview-pane${containFallback ? ' fea-preview-contained' : ''}`}>
          <div className="fea-preview-toolbar">
            <div className="fea-preview-zoom">
              <button type="button" className="fea-preview-zoom-btn" onClick={() => setZoom(z => Math.max(0.25, Number((z - 0.1).toFixed(3))))} aria-label="Reducir zoom">−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" className="fea-preview-zoom-btn" onClick={() => setZoom(z => Math.min(1.5, Number((z + 0.1).toFixed(3))))} aria-label="Aumentar zoom">+</button>
              <button type="button" className="fea-preview-zoom-btn" onClick={computeFit} aria-label="Ajustar a ancho" title="Ajustar a ancho">⤢</button>
            </div>
          </div>
          {previewLoading && <p className="fea-preview-loading">Actualizando vista…</p>}
          <div ref={styleRef} className="formato-preview-styles" />
          <div ref={scaleWrapRef} className="fea-preview-scale-wrap" style={{ zoom }}>
            <div ref={previewRef} className="fea-preview-body" />
          </div>
        </div>

        <div className="fea-editor-pane">
          {schema.scalars.map(f => (
            <ScalarField
              key={f.key}
              field={f}
              value={data[f.key]}
              disabled={streaming}
              onChange={(v) => patchData({ [f.key]: v })}
            />
          ))}
          {schema.arrays.map(arr => (
            <ArrayEditor
              key={arr.key}
              arrayDef={arr}
              items={data[arr.key]}
              disabled={streaming}
              onChange={(v) => patchData({ [arr.key]: v })}
            />
          ))}
          <div className="fea-editor-actions">
            <button type="button" className="btn btn-primary" onClick={copyReport} disabled={streaming}>
              {copied ? '¡Copiado!' : 'Copiar JSON'}
            </button>
            {onSaveEdits && (
              <button type="button" className="btn btn-ghost" onClick={handleSave} disabled={streaming}>Guardar cambios</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
