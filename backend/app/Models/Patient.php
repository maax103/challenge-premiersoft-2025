<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Patient extends Model
{
    use HasUuids;

    protected $fillable = [
        'cpf',
        'full_name',
        'gender',
        'city',
        'neighborhood',
        'has_insurance',
        'cid_id',
    ];

    protected $casts = [
        'has_insurance' => 'boolean',
    ];

    /**
     * Get the CID that the patient belongs to.
     */
    public function cid(): BelongsTo
    {
        return $this->belongsTo(Cid::class);
    }
}