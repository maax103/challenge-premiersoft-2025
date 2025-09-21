<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Patient extends Model
{
    protected $fillable = [
        'cpf',
        'codigo',
        'full_name',
        'gender',
        'city',
        'neighborhood',
        'has_insurance',
        'cid_id',
    ];

    protected $casts = [
        'has_insurance' => 'boolean',
        'city' => 'integer',
    ];

    /**
     * Get the CID that the patient belongs to.
     */
    public function cid(): BelongsTo
    {
        return $this->belongsTo(Cid::class);
    }

    /**
     * Get the city that this patient belongs to.
     */
    public function cityModel(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city');
    }
}