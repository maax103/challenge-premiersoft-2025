<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cid extends Model
{
    protected $fillable = [
        'code',
        'name',
    ];

    /**
     * Get the patients for the CID.
     */
    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }
}