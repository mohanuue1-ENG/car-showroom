import ProfileForm from '../../components/ProfileForm';
import { PageHeader } from './ui';

export default function AdminProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="My profile" subtitle="Your admin account details and password." />
      <ProfileForm showAddress={false} />
    </div>
  );
}
