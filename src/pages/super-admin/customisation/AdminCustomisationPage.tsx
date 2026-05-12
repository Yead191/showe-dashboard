import { Image as ImageIcon } from 'lucide-react';
import { Button, Tabs } from 'antd';
import { PageHeader, Panel } from '@/components/ui';

export default function AdminCustomisationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Customisation"
        description="App appearance defaults and email templates that apply across all venues."
      />

      <Tabs
        items={[
          { key: 'app', label: 'App appearance', children: <AppAppearance /> },
          // { key: 'emails', label: 'Email templates', children: <EmailTemplates /> },
        ]}
      />
    </>
  );
}

function AppAppearance() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Panel title="Brand colours" description="Default fallback colours for venues without their own brand.">
        <div className="space-y-4">
          {[
            { label: 'Primary', value: '#014B52' },
            { label: 'Accent', value: '#F5A800' },
            { label: 'Surface', value: '#FBFAF7' },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-line shrink-0" style={{ background: c.value }} />
              <div className="flex-1">
                <label className="field-label">{c.label}</label>
                <input className="input-base" defaultValue={c.value} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Splash screen" description="The opening screen on the SHOWE app.">
        <div className="rounded-xl border border-line aspect-[9/16] max-h-[280px] mx-auto bg-primary text-ink-inverse flex flex-col items-center justify-center gap-2 panel-deep relative overflow-hidden">
          <img src="/splash-screen.gif" alt="splash screen" className='h-full w-full object-cover' />
        </div>
        <Button block className="mt-4" icon={<ImageIcon size={13} />}>
          Replace splash image
        </Button>
      </Panel>
    </div>
  );
}

// function EmailTemplates() {
//   return (
//     <Panel padded={false}>
//       <ul className="divide-y divide-line">
//         {[
//           { name: 'Welcome — new Organiser', subject: 'Welcome to SHOWE.' },
//           { name: 'Welcome — new end user', subject: 'Your first programme is here.' },
//           { name: 'Refund approved', subject: 'Your refund is on its way.' },
//           { name: 'Subscription renewing', subject: 'Your SHOWE subscription renews soon.' },
//           { name: 'Programme published', subject: 'Your programme is live.' },
//         ].map((t) => (
//           <li key={t.name} className="flex items-center gap-3 p-4">
//             <span className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center">
//               <Mail size={14} />
//             </span>
//             <div className="flex-1">
//               <div className="font-semibold text-ink">{t.name}</div>
//               <div className="text-[12.5px] text-ink-faint">Subject: {t.subject}</div>
//             </div>
//             <Button>Edit</Button>
//           </li>
//         ))}
//       </ul>
//     </Panel>
//   );
// }
