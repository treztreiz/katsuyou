<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\VerbRepository;
use App\Services\KanaConvertor;

/**
 * @ORM\Entity(repositoryClass=VerbRepository::class)
 */
class Verb
{   

    public function __construct(array $data) {
        $this->hydrateVerb($data);
    }

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $word;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $reading;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $romaji;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $type;

    /**
     * @ORM\Column(type="text")
     */
    private $definition;

    /**
     * @ORM\Column(type="boolean")
     */
    private $common;

    /**
     * @ORM\Column(type="array")
     */
    private $data = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getWord(): ?string
    {
        return $this->word;
    }

    public function setWord(string $word): self
    {
        $this->word = $word;

        return $this;
    }

    public function getReading(): ?string
    {
        return $this->reading;
    }

    public function setReading(string $reading): self
    {
        $this->reading = $reading;

        return $this;
    }

    public function getRomaji(): ?string
    {
        return $this->romaji;
    }

    public function setRomaji(string $romaji): self
    {
        $this->romaji = $romaji;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getDefinition(): ?string
    {
        return $this->definition;
    }

    public function setDefinition(string $definition): self
    {
        $this->definition = $definition;

        return $this;
    }

    public function getCommon(): ?bool
    {
        return $this->common;
    }

    public function setCommon(bool $common): self
    {
        $this->common = $common;

        return $this;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): self
    {
        $this->data = $data;

        return $this;
    }

    public function getVerb()
    {
        return [
            'word' => $this->getWord(),
            'reading' => $this->getReading(),
            'romaji' => $this->getRomaji(),
            'type' => $this->getType(),
            'definition' => $this->getDefinition()
        ];
    }

    private function hydrateVerb(array $data): self
    {   
        $this->setData($data);

        $sense = $data['senses'][0];
        
        foreach( $sense['parts_of_speech'] as $speech ) {

            if( preg_match('/^suru verb/i', $speech) || preg_match('/^kuru verb/i', $speech) ) {
                $this->setType('suru-kuru');
                break;
            }

            if( preg_match('/^ichidan verb/i', $speech) ) {
                $this->setType('ichidan');
                break;
            }

            if( preg_match('/^godan verb/i', $speech) ) {
                $this->setType('godan');
                break;
            }

        }

        if( null == $this->getType() ) throw new \Exception('This word is not a verb.');

        $this->setDefinition( $sense['english_definitions'][0] );

        $japanese = $data['japanese'][0];
        $reading = $japanese['reading'];
        $word = isset($japanese['word']) ? $japanese['word'] : $reading;

        if( $this->getType() == 'suru-kuru' && !preg_match('/する$/', $reading) && $reading != 'くる' ) {
            $reading .= 'する';
            $word .= 'する';
        }

        $this->setWord( $word );
        $this->setReading( $reading );
        $this->setRomaji( KanaConvertor::convert($reading) );

        $this->setCommon( $data['is_common'] );

        return $this;
    }

}