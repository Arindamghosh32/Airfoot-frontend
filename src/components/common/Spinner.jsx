export default function Spinner({ fullscreen, small }) {
  const size = small ? 20 : 40;
  const spinner = (
    <div style={{
      width: size, height: size,
      border: `${small ? 2 : 3}px solid var(--blue-100)`,
      borderTopColor: 'var(--blue-500)',
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
    }} />
  );
  if (fullscreen) return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fff', zIndex: 9999,
    }}>
      {spinner}
    </div>
  );
  return spinner;
}