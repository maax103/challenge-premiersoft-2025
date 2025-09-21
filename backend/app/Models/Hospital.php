<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hospital extends Model
{
    use HasFactory;

    protected $table = 'hospitals';

    protected $fillable = [
        'hospital_code',
        'name',
        'city',
        'neighborhood',
        'total_beds'
    ];

    protected $casts = [
        'total_beds' => 'integer',
    ];

    /**
     * Get the city that this hospital belongs to.
     */
    public function cityModel(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city');
    }

    /**
     * Get the specialties for this hospital.
     */
    public function specialties(): HasMany
    {
        return $this->hasMany(Specialty::class, 'hospital_id');
    }
}