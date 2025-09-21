<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Specialty extends Model
{
    use HasFactory;

    protected $table = 'specialties';

    protected $fillable = [
        'hospital_id',
        'name'
    ];

    protected $casts = [
        'hospital_id' => 'integer',
    ];

    /**
     * Get the hospital that this specialty belongs to.
     */
    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class, 'hospital_id');
    }
}