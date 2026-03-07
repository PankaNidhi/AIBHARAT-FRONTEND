interface StatusBadgeProps {
  status: 'Safe' | 'Alert' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Active' | 'Acknowledged' | 'Resolved' | 'Empty' | 'Partial' | 'NearlyFull' | 'Full';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Safe':
      case 'Resolved':
      case 'Empty':
      case 'Partial':
        return 'bg-safe/20 text-safe border-safe';
      case 'Low':
      case 'Acknowledged':
        return 'bg-info/20 text-info border-info';
      case 'Medium':
      case 'NearlyFull':
        return 'bg-warning/20 text-warning border-warning';
      case 'High':
      case 'Alert':
      case 'Active':
      case 'Full':
        return 'bg-danger/20 text-danger border-danger';
      case 'Critical':
        return 'bg-danger text-white border-danger';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${getStatusColor()} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
