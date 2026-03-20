<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/test-register', function () {
    $user = \App\Models\User::create([
        'name' => 'test',
        'email' => 'test@test.com',
        'password' => bcrypt('123456')
    ]);

    return $user;
});