import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { router, useForm, usePage } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '../input-error';
import { Button } from '../ui/button';

export default function TwoFactorSetup() {
    const [step, setStep] = useState(0);
    const { twoFactorQr, canSetupTwoFactor } = usePage<{ twoFactorQr: string | null; canSetupTwoFactor: boolean }>().props;
    const form = useForm({ otp: '' });

    const handleSubmit = () => {
        if (step !== 1) {
            setStep(step + 1);
            return;
        }

        form.post(route('two-factor.store'));
    };

    if (!canSetupTwoFactor) return null;

    if (twoFactorQr) {
        return (
            <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-200/10 dark:bg-blue-700/10">
                <div className="relative space-y-0.5">
                    <p className="font-medium">Two Factor Authentication</p>
                    <p className="text-sm">Scan the QR code with your authenticator app and enter the code to activate two factor authentication.</p>
                    {step === 0 && <img alt="Two Factor QR" src={twoFactorQr} className="mx-auto mt-4 rounded-lg" />}
                    {step === 1 && (
                        <div className="mx-auto mt-4 flex flex-col items-center justify-center">
                            <InputOTP
                                autoFocus
                                value={form.data.otp}
                                onChange={(newValue) => form.setData('otp', newValue)}
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <InputOTPSlot index={i} key={i} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                            <InputError className="mt-2" message={form.errors.otp} />
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <Button onClick={() => setStep(step - 1)} disabled={step === 0} variant="secondary" className="mt-4">
                            Previous
                        </Button>
                        <Button onClick={handleSubmit} className="mt-4">
                            {step === 1 ? 'Enable' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-200/10 dark:bg-blue-700/10">
            <div className="relative space-y-0.5">
                <p className="font-medium">Two Factor Authentication</p>
                <p className="text-sm">Make your account more secure by using two-factor authentication.</p>
                <Button onClick={() => router.get(route('two-factor.create'))} className="mt-4">
                    Setup 2FA
                </Button>
            </div>
        </div>
    );
}
