import logo from '@/assets/logo.png';

export default function Logo({ className }: { className?: string }) {
    return (
        <img src={logo} alt='Logo' className={className ?? 'h-full w-full'} />
    );
};