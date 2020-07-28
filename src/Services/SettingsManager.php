<?php

namespace App\Services;

use App\Entity\Verb;
use App\Repository\VerbRepository;
use Symfony\Component\HttpFoundation\Session\Session;

class SettingsManager {

    private $session;
    private $formality = ['plain', 'polite'];
    private $negation = [false, true];

    public function __construct(Session $session)
    {
        $this->session = $session;
    }

    public function retrieve()
    {   
        return [
            "formality" =>  $this->getSessionParameter('formality', $this->formality),
            "negation" =>   $this->getSessionParameter('negation', $this->negation),
            "tenses" =>     $this->getTensesParameter(),
            "verbs" =>      $this->getVerbsParameter(),
            "romaji" =>     $this->getSessionParameter('romaji', true),
            "furigana" =>   $this->getSessionParameter('furigana', true),
            "type" =>       $this->getSessionParameter('type', true),
            "definition" => $this->getSessionParameter('definition', true),
            "sound" =>      $this->getSessionParameter('sound', true),
        ];
    }

    public function update(string $param, $value, VerbRepository $verbRepository, array $tenses)
    {

        if($param == "verbs") {
            
            $verb = $verbRepository->find($value);
            if(null == $verb) return false;
            $value = $this->updateVerbs($verb);

        } elseif ($param == "tenses") { 
            
            if(!isset($tenses[$value])) return false;
            $value = $this->updateTenses($value);

        } elseif ($param == "formality") {

            if( "both" == $value ) $value = $this->formality;
            elseif(in_array($value, $this->formality)) $value = [$value];
            else return false;

        } elseif ($param == "negation") {
            
            if( "both" == $value ) $value = $this->negation;
            elseif(in_array($value, $this->negation)) $value = [filter_var($value, FILTER_VALIDATE_BOOLEAN)];
            else return false;

        }  else {

            $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            
        }

        $this->session->set($param, $value);

        return $this->retrieve();

    }

    private function updateVerbs(Verb $verb)
    {   
        $verbs = $this->getVerbsParameter();
        if(!in_array($verb->getId(), $verbs)) $verbs[] = $verb->getId();
        else unset($verbs[array_search($verb->getId(), $verbs)]);
        return array_values($verbs);
    }

    private function updateTenses(string $tense)
    {   
        $tenses = $this->getTensesParameter();
        if(!in_array($tense, $tenses)) $tenses[] = $tense;
        else unset($tenses[array_search($tense, $tenses)]);
        return array_values($tenses);
    }

    private function getSessionParameter(string $name, $default)
    {
        $param = $this->session->get($name);
        return $param !== null ? $param : $default;
    }

    private function getVerbsParameter()
    {   
        return $this->getSessionParameter('verbs', []);
    }

    private function getTensesParameter()
    {   
        return $this->getSessionParameter('tenses', []);
    }

}