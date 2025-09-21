<?php

namespace App\Domain\Geography\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Estado;

class City extends Model
{
    use HasFactory;

    protected $table = 'cities';

    protected $fillable = [
        'id',
        'name',
        'latitude',
        'longitude',
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
        'population' => 'integer'
    ];

    public function state()
    {
        return $this->belongsTo(Estado::class, 'state_id', 'id');
    }
}