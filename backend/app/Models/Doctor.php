<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Doctor extends Model
{
    use HasFactory;

    protected $table = 'doctors';

    protected $fillable = [
        'doctor_code',
        'full_name',
        'specialty',
        'city'
    ];

    protected $casts = [
        'city' => 'integer',
    ];

    /**
     * Get the city that this doctor belongs to.
     */
    public function cityModel(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city');
    }
}