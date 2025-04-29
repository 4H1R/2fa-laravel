<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TwoFactorController extends Controller
{
    public function create(Request $request, TwoFactorService $twoFactorService): RedirectResponse
    {
        abort_if($request->user()->two_factor_enabled, 403);

        $twoFactorService->generateQrCodeFor($request->user());

        return to_route('profile.edit', ['setup-2fa' => true]);
    }

    public function store(Request $request, TwoFactorService $twoFactorService): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        if (!$twoFactorService->isValid($request->user(), $request->otp)) {
            throw ValidationException::withMessages([
                'otp' => ['The provided code is invalid.'],
            ]);
        }

        $request->user()->update(['two_factor_enabled' => true]);

        return back();
    }
}
