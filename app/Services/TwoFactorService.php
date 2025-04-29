<?php

namespace App\Services;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Session;
use PragmaRX\Google2FALaravel\Google2FA;

class TwoFactorService
{
    const SESSION_NAME = 'two_factor_auth';

    public function __construct(private Google2FA $google2fa) {}

    public function generateQrCodeFor(User $user): string
    {
        $secret = $this->google2fa->generateSecretKey();
        $qrCode = $this->generateQrCode($user->email, $secret);

        $user->update(['two_factor_secret' => encrypt($secret), 'two_factor_qr' => $qrCode]);

        return $qrCode;
    }

    public function isValid(User $user, string $code): bool
    {
        return $this->google2fa->verifyKey(decrypt($user->two_factor_secret), $code);
    }

    public function isCurrentSessionExpired(): bool
    {
        $data = Session::get(self::SESSION_NAME);

        if (!$data) {
            return true;
        }

        $isExpired = now()->gt(Carbon::parse($data['timestamp'])->addMinutes(2));

        if ($isExpired) {
            Session::forget(self::SESSION_NAME);
            return true;
        }

        return false;
    }

    private function generateQrCode(string $holder, $secret): string
    {
        return $this->generateImageUri($this->google2fa->getQRCodeUrl(config('app.name'), $holder, $secret));
    }

    private function generateImageUri(string $content): string
    {
        $renderer = new ImageRenderer(new RendererStyle(300), new SvgImageBackEnd);
        $writer = new Writer($renderer);
        $svg = $writer->writeString($content);

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }
}
