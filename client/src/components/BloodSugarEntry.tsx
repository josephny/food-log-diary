import { useState } from 'react';
import { format } from 'date-fns';
import { bloodSugarAPI } from '../services/api';

export default function BloodSugarEntry() {
  const [reading, setReading] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importMode, setImportMode] = useState(false);
  const [importData, setImportData] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reading) {
      setMessage({ type: 'error', text: 'Please enter a blood sugar reading' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await bloodSugarAPI.addReading({
        reading: parseFloat(reading),
        timestamp: new Date(timestamp).toISOString(),
        notes: notes || undefined
      });

      setMessage({ type: 'success', text: 'Blood sugar reading added successfully!' });
      setReading('');
      setNotes('');
      setTimestamp(new Date().toISOString().slice(0, 16));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add reading' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Please paste CSV data' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // Parse CSV format: timestamp,reading,notes (optional)
      const lines = importData.trim().split('\n');
      const readings = lines.map(line => {
        const parts = line.split(',');
        return {
          timestamp: parts[0].trim(),
          reading: parseFloat(parts[1].trim()),
          notes: parts[2]?.trim() || undefined
        };
      });

      await bloodSugarAPI.importReadings(readings);
      setMessage({ type: 'success', text: `Successfully imported ${readings.length} readings!` });
      setImportData('');
      setImportMode(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to import readings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Add Blood Sugar Reading</h2>

        {message && (
          <div className={message.type === 'success' ? 'success' : 'error'}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <button
            className={`btn ${!importMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setImportMode(false)}
            style={{ marginRight: '0.5rem' }}
          >
            Single Entry
          </button>
          <button
            className={`btn ${importMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setImportMode(true)}
          >
            Import CSV
          </button>
        </div>

        {!importMode ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Blood Sugar Reading (mg/dL)</label>
              <input
                type="number"
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                placeholder="120"
                step="0.1"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Date & Time</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Before meal, After exercise"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Reading'}
            </button>
          </form>
        ) : (
          <div>
            <div className="form-group">
              <label>CSV Data</label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Format: timestamp,reading,notes&#10;2024-01-15T08:00:00,120,Before breakfast&#10;2024-01-15T12:00:00,145,After lunch"
                rows={10}
                style={{ fontFamily: 'monospace' }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                Format: timestamp,reading,notes (one reading per line)
              </small>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import Readings'}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>About Libre 3 Integration</h2>
        <p>
          Currently, this app supports manual entry and CSV import of blood sugar readings.
          To import data from your Libre 3:
        </p>
        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Export your Libre 3 data (check LibreView or the LibreLink app)</li>
          <li>Format as CSV: timestamp,reading,notes</li>
          <li>Use the Import CSV feature above</li>
        </ol>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Future versions may include direct API integration with LibreView.
        </p>
      </div>
    </div>
  );
}


