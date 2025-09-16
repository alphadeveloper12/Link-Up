import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Download, Check } from 'lucide-react';

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSigned: () => void;
  projectData?: {
    name: string;
    clientName: string;
    teamName: string;
  };
}

const NDAModal: React.FC<NDAModalProps> = ({
  isOpen,
  onClose,
  onSigned,
  projectData = {
    name: 'Project Development',
    clientName: 'Client Company',
    teamName: 'Development Team',
  },
}) => {
  const [step, setStep] = useState<'form' | 'preview' | 'signed'>('form');
  const [formData] = useState({
    clientName: projectData.clientName,
    clientEntity: '',
    clientAddress: '',
    teamName: projectData.teamName,
    teamEntity: '',
    teamAddress: '',
    purpose: projectData.name,
    termYears: '2',
    survivalYears: '5',
    governingLaw: 'Delaware',
    venue: 'Delaware',
  });

  const populateNDA = () => {
    const today = new Date().toLocaleDateString();
    const docHash = Math.random().toString(36).substring(2, 15);

    return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Mutual NDA</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  :root { --fg:#111; --muted:#666; --acc:#0b5fff; }
  body { font-family: ui-serif, Georgia, "Times New Roman", serif; color:var(--fg); margin:32px; line-height:1.45; }
  h1 { font-size:22px; margin:0 0 8px; }
  h2 { font-size:16px; margin:18px 0 8px; }
  p, li { font-size:12.5px; margin:8px 0; }
  .muted { color:var(--muted); }
  .box { border:1px solid #ddd; padding:16px; border-radius:8px; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
  .sig { margin-top:28px; display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  .line { border-top:1px solid #222; height:0; margin-top:40px; }
  .small { font-size:11px; }
</style>
</head>
<body>
  <h1>Mutual Non-Disclosure Agreement</h1>
  <p class="muted small">Effective Date: <strong>${today}</strong></p>

  <div class="box grid small">
    <div>
      <strong>Party A (Client)</strong><br/>
      ${formData.clientName}<br/>${formData.clientEntity}<br/>${formData.clientAddress}
    </div>
    <div>
      <strong>Party B (Team/Provider)</strong><br/>
      ${formData.teamName}<br/>${formData.teamEntity}<br/>${formData.teamAddress}
    </div>
  </div>

  <p><strong>Purpose.</strong> The parties may exchange information to evaluate and/or perform
  <em>${formData.purpose}</em> (the "Purpose").</p>

  <h2>1. Confidential Information</h2>
  <p>"Confidential Information" means non-public information disclosed by a party ("Discloser") to the other ("Recipient"),
  in any form, that is identified as confidential or should reasonably be considered confidential...</p>

  <div class="sig small">
    <div>
      <div class="line"></div>
      <strong>${formData.clientName}</strong><br/>
      Name/Title: __________________________<br/>
      Date: ________________________________
    </div>
    <div>
      <div class="line"></div>
      <strong>${formData.teamName}</strong><br/>
      Name/Title: __________________________<br/>
      Date: ________________________________
    </div>
  </div>

  <p class="muted small">Doc: NDA-short v1.0 · Hash: ${docHash}</p>
</body>
</html>`;
  };

  const downloadNDA = () => {
    const ndaContent = populateNDA();
    const blob = new Blob([ndaContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NDA-${formData.clientName}-${formData.teamName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSign = () => {
    setStep('signed');
    setTimeout(() => {
      onSigned();
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Non-Disclosure Agreement
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Client Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input readOnly value={formData.clientName} />
                  </div>
                  <div>
                    <Label>Entity Type</Label>
                    <Input readOnly placeholder="LLC, Corporation, etc." value={formData.clientEntity} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Textarea readOnly value={formData.clientAddress} />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Team Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input readOnly value={formData.teamName} />
                  </div>
                  <div>
                    <Label>Entity Type</Label>
                    <Input readOnly placeholder="LLC, Corporation, etc." value={formData.teamEntity} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Textarea readOnly value={formData.teamAddress} />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Agreement Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purpose</Label>
                  <Input readOnly value={formData.purpose} />
                </div>
                <div>
                  <Label>Term (Years)</Label>
                  <Input readOnly value={formData.termYears} />
                </div>
                <div>
                  <Label>Governing Law</Label>
                  <Input readOnly value={formData.governingLaw} />
                </div>
                <div>
                  <Label>Venue</Label>
                  <Input readOnly value={formData.venue} />
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('preview')}>Preview NDA</Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: populateNDA() }} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('form')}>
                Back to View
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadNDA}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleSign}>Sign Agreement</Button>
              </div>
            </div>
          </div>
        )}

        {step === 'signed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">NDA Signed Successfully!</h3>
            <p className="text-gray-600">The agreement has been recorded and both parties will receive a copy.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NDAModal;
