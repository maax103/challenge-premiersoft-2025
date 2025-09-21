<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estado extends Model
{
    use HasFactory;

    protected $table = 'states';

    protected $primaryKey = 'codigo_uf';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'codigo_uf', 'uf', 'name', 'latitude', 'longitude', 'location', 'region'
    ];

    protected $casts = [
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
    ];

    /**
     * Get the cities for this state.
     */
    public function cities(): HasMany
    {
        return $this->hasMany(City::class, 'state_id', 'codigo_uf');
    }
}
