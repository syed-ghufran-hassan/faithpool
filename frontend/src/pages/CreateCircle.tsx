import { memo, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Coins, 
  Calendar, 
  Lock, 
  Eye,
  ArrowRight,
  Info 
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import './CreateCircle.css';

export interface CreateCircleFormData {
  name: string;
  description: string;
  maxMembers: number;
  contribution: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  isPrivate: boolean;
}

interface FrequencyOption {
  value: CreateCircleFormData['frequency'];
  label: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const INITIAL_FORM_DATA: CreateCircleFormData = {
  name: '',
  description: '',
  maxMembers: 5,
  contribution: 50,
  frequency: 'weekly',
  isPrivate: false,
};

const CreateCircle = memo(function CreateCircle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateCircleFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Circle created successfully! (Demo mode)');
    navigate('/circles');
  }, [navigate]);

  const totalPool = useMemo(() => 
    formData.maxMembers * formData.contribution,
    [formData.maxMembers, formData.contribution]
  );

  const duration = useMemo(() => {
    const unit = formData.frequency === 'weekly' 
      ? 'weeks' 
      : formData.frequency === 'biweekly' 
        ? 'bi-weeks' 
        : 'months';
    return `~${formData.maxMembers} ${unit}`;
  }, [formData.maxMembers, formData.frequency]);

  return (
    <div className="create-circle">
      <div className="create-circle__header">
        <h1 className="create-circle__title">Create a Circle</h1>
        <p className="create-circle__subtitle">Set up your own rotating savings circle</p>
      </div>

      <div className="create-circle__container">
        <form onSubmit={handleSubmit} className="create-circle__form">
          <Card className="create-circle__section">
            <h2 className="create-circle__section-title">
              <Info size={20} />
              Basic Information
            </h2>
            
            <div className="create-circle__field">
              <Input
                label="Circle Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Tech Builders"
                required
              />
            </div>

            <div className="create-circle__field">
              <label className="create-circle__label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your circle's purpose and goals..."
                rows={3}
                className="create-circle__textarea"
              />
            </div>
          </Card>

          <Card className="create-circle__section">
            <h2 className="create-circle__section-title">
              <Users size={20} />
              Circle Settings
            </h2>
            
            <div className="create-circle__row">
              <div className="create-circle__field">
                <Input
                  type="number"
                  label="Max Members"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  min={2}
                  max={20}
                  required
                  leftIcon={<Users size={18} />}
                />
                <span className="create-circle__hint">2-20 members</span>
              </div>

              <div className="create-circle__field">
                <Input
                  type="number"
                  label="Contribution (STX)"
                  name="contribution"
                  value={formData.contribution}
                  onChange={handleChange}
                  min={1}
                  required
                  leftIcon={<Coins size={18} />}
                />
                <span className="create-circle__hint">Per round</span>
              </div>
            </div>

            <div className="create-circle__field">
              <label className="create-circle__label" htmlFor="frequency">
                <Calendar size={18} />
                Payout Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="create-circle__select"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-circle__field create-circle__field--checkbox">
              <label className="create-circle__checkbox-label">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="create-circle__checkbox"
                />
                <span className="create-circle__checkbox-icon">
                  {formData.isPrivate ? <Lock size={16} /> : <Eye size={16} />}
                </span>
                Make this circle private (invite only)
              </label>
            </div>
          </Card>

          <Button 
            type="submit" 
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            rightIcon={<ArrowRight size={18} />}
            className="create-circle__submit"
          >
            {isSubmitting ? 'Creating...' : 'Create Circle'}
          </Button>
        </form>

        <aside className="create-circle__preview">
          <Card className="create-circle__preview-card">
            <h3 className="create-circle__preview-title">Circle Preview</h3>
            
            <div className="create-circle__preview-name">
              {formData.name || 'Your Circle Name'}
            </div>
            
            <div className="create-circle__preview-stats">
              <div className="create-circle__preview-stat">
                <Users size={16} />
                <span className="create-circle__preview-stat-label">Members</span>
                <span className="create-circle__preview-stat-value">{formData.maxMembers}</span>
              </div>
              <div className="create-circle__preview-stat">
                <Coins size={16} />
                <span className="create-circle__preview-stat-label">Contribution</span>
                <span className="create-circle__preview-stat-value">{formData.contribution} STX</span>
              </div>
              <div className="create-circle__preview-stat">
                <Calendar size={16} />
                <span className="create-circle__preview-stat-label">Frequency</span>
                <span className="create-circle__preview-stat-value">{formData.frequency}</span>
              </div>
            </div>

            <div className="create-circle__pool">
              <div className="create-circle__pool-visual">
                <div className="create-circle__pool-circle">
                  <span className="create-circle__pool-amount">{totalPool}</span>
                  <span className="create-circle__pool-label">STX Pool</span>
                </div>
              </div>
              <p className="create-circle__pool-text">
                Each member will receive <strong>{totalPool} STX</strong> when it's their turn
              </p>
            </div>

            <div className="create-circle__timeline">
              <h4 className="create-circle__timeline-title">Timeline</h4>
              <ul className="create-circle__timeline-list">
                <li>Total Rounds: {formData.maxMembers}</li>
                <li>Duration: {duration}</li>
                <li>Total Cycle: {totalPool} STX per member</li>
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
});

export { CreateCircle as default };
