<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthTwoFactorController extends Controller
{
    public function __construct(private readonly TwoFactorService $twoFactorService) {}

    public function create(): Response|RedirectResponse
    {
        if ($this->twoFactorService->isCurrentSessionExpired()) {
            return to_route('login');
        }

        return Inertia::render('auth/two-factor');
    }

    public function store(Request $request): RedirectResponse
    {
        if ($this->twoFactorService->isCurrentSessionExpired()) {
            return to_route('login');
        }

        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $data = Session::get(TwoFactorService::SESSION_NAME);
        $user = User::find($data['user_id']);

        if (!$this->twoFactorService->isValid($user, $request->otp)) {
            throw ValidationException::withMessages([
                'otp' => ['The provided code is invalid.'],
            ]);
        }

        Auth::login($user, Session::get($data['remember']));
        Session::forget(TwoFactorService::SESSION_NAME);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
