import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

type TwoFactorForm = {
    otp: string;
};

export default function Login() {
    const { data, setData, post, processing, errors } = useForm<Required<TwoFactorForm>>({
        otp: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('auth.two-factor'));
    };

    return (
        <AuthLayout title="Two Factor" description="Enter your two factor code to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email">One Time Code</Label>
                        <InputOTP
                            className="w-full"
                            autoFocus
                            value={data.otp}
                            onChange={(newValue) => setData('otp', newValue)}
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                        >
                            <InputOTPGroup>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <InputOTPSlot index={i} key={i} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <InputError className="mt-2" message={errors.otp} />
                </div>

                <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Log in
                </Button>
            </form>
        </AuthLayout>
    );
}
