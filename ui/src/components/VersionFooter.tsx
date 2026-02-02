import packageJson from '../../../package.json';

interface VersionFooterProps {
  className?: string;
}

export function VersionFooter({ className = '' }: VersionFooterProps) {
  const version = packageJson.version;

  return (
    <footer
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        padding: '4px 8px',
        fontSize: '10px',
        color: '#9ca3af',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopLeftRadius: '4px',
        zIndex: 9999,
      }}
    >
      v{version}
    </footer>
  );
}

export default VersionFooter;
