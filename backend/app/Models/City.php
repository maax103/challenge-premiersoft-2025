<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $table = 'cities';

    protected $fillable = [
        'city_code',
        'name',
        'latitude',
        'longitude',
        'location',
        'is_capital',
        'state_id',
        'siafi_id',
        'area_code',
        'time_zone',
        'population'
    ];

    protected $casts = [
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'is_capital' => 'boolean',
        'population' => 'integer',
        'area_code' => 'integer',
        'siafi_id' => 'integer',
        'city_code' => 'integer',
    ];

    /**
     * Get the state that this city belongs to.
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'state_id', 'codigo_uf');
    }

    /**
     * Get the hospitals for this city.
     */
    public function hospitals(): HasMany
    {
        return $this->hasMany(Hospital::class, 'city');
    }

    /**
     * Get the doctors for this city.
     */
    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class, 'city');
    }

    /**
     * Get the patients for this city.
     */
    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'city');
    }
}