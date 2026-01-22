import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCircle.css';

function CreateCircle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 5,
    contribution: 50,
    frequency: 'weekly',
    isPrivate: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate contract call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Circle created successfully! (Demo mode)');
    navigate('/circles');
  };

  const totalPool = formData.maxMembers * formData.contribution;

  return (
    <div className="create-circle-page">
      <div className="create-header">
        <h1>Create a Circle</h1>
        <p>Set up your own rotating savings circle</p>
      </div>

      <div className="create-container">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Circle Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Tech Builders"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your circle's purpose and goals..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Circle Settings</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maxMembers">Max Members</label>
                <input
                  type="number"
                  id="maxMembers"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  min={2}
                  max={20}
                  required
                />
                <span className="input-hint">2-20 members</span>
              </div>

              <div className="form-group">
                <label htmlFor="contribution">Contribution (STX)</label>
                <input
                  type="number"
                  id="contribution"
                  name="contribution"
                  value={formData.contribution}
                  onChange={handleChange}
                  min={1}
                  required
                />
                <span className="input-hint">Per round</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="frequency">Payout Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Make this circle private (invite only)
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Circle'}
          </button>
        </form>

        <div className="create-preview">
          <div className="preview-card">
            <h3>Circle Preview</h3>
            
            <div className="preview-name">
              {formData.name || 'Your Circle Name'}
            </div>
            
            <div className="preview-stats">
              <div className="preview-stat">
                <span className="label">Members</span>
                <span className="value">{formData.maxMembers}</span>
              </div>
              <div className="preview-stat">
                <span className="label">Contribution</span>
                <span className="value">{formData.contribution} STX</span>
              </div>
              <div className="preview-stat">
                <span className="label">Frequency</span>
                <span className="value">{formData.frequency}</span>
              </div>
            </div>

            <div className="preview-pool">
              <div className="pool-visual">
                <div className="pool-circle">
                  <span className="pool-amount">{totalPool}</span>
                  <span className="pool-label">STX Pool</span>
                </div>
              </div>
              <p>Each member will receive <strong>{totalPool} STX</strong> when it's their turn</p>
            </div>

            <div className="preview-timeline">
              <h4>Timeline</h4>
              <ul>
                <li>Total Rounds: {formData.maxMembers}</li>
                <li>Duration: ~{formData.maxMembers} {formData.frequency === 'weekly' ? 'weeks' : formData.frequency === 'biweekly' ? 'bi-weeks' : 'months'}</li>
                <li>Total Cycle: {formData.contribution * formData.maxMembers} STX per member</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCircle;
