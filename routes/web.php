<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');

});

Route::get('{any}', function () {
    return view('welcome');
})->where('any', '.*');


Route::get('/test-register', function () {
    $user = \App\Models\User::create([
        'name' => 'test',
        'email' => 'test@test.com',
        'password' => bcrypt('123456')
    ]);

    return $user;
});