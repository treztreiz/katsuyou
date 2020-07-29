<?php

namespace App\Services;

use App\Entity\Verb;
use App\Repository\VerbRepository;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class SettingsManager {

    private $session;
    private $verbRepository;
    private $tenses = [];
    private $verbs = [];
    private $formality = ['plain', 'polite'];
    private $negation = [false, true];
    private $timer = [20000, 10000, 5000];

    public function __construct(SessionInterface $session, ParameterBagInterface $params, VerbRepository $verbRepository)
    {   
        $this->session = $session;
        $this->verbRepository = $verbRepository;
        $this->tenses = $params->get('tenses');
        $this->verbs = $params->get('verbs')['defaults'];
    }

    public function getTenses()
    {
        return $this->tenses;
    }

    public function getVerbs()
    {
        return $this->verbRepository->getVerbs();
    }

    public function retrieve()
    {   
        return [
            "formality" =>  $this->getSessionParameter('formality', $this->formality),
            "negation" =>   $this->getSessionParameter('negation', $this->negation),
            "tenses" =>     $this->getTensesParameter(),
            "verbs" =>      $this->getVerbsParameter(),
            "romaji" =>     $this->getSessionParameter('romaji', false),
            "furigana" =>   $this->getSessionParameter('furigana', true),
            "type" =>       $this->getSessionParameter('type', false),
            "definition" => $this->getSessionParameter('definition', true),
            "sound" =>      $this->getSessionParameter('sound', true),
            "timer" =>      $this->getSessionParameter('timer', $this->timer[0])
        ];
    }

    public function update(string $param, $value)
    {

        if($param == "verbs") {
            
            $verb = $this->verbRepository->find($value);
            if(null == $verb) return false;
            $value = $this->updateVerbs($verb);

        } elseif ($param == "tenses") { 
            
            if(!in_array($value, $this->getTensesArray())) return false;
            $value = $this->updateTenses($value);

        } elseif ($param == "formality") {

            if( "both" == $value ) $value = $this->formality;
            elseif(in_array($value, $this->formality)) $value = [$value];
            else return false;

        } elseif ($param == "negation") {
            
            if( "both" == $value ) $value = $this->negation;
            elseif(in_array($value, $this->negation)) $value = [filter_var($value, FILTER_VALIDATE_BOOLEAN)];
            else return false;

        }  elseif ($param == "timer" && $value ) {
            
            if( $value == "false" )  $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            else {
                $value = intval($value);
                if(!in_array($value, $this->timer)) return false;
            }

        } else {

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
        return $this->getSessionParameter('verbs', $this->verbs);
    }

    private function getTensesArray($default = false)
    {   
        $tenses = [];
        foreach( $this->tenses as $tense => $value ) {
            if(!$default || isset($value['default'])) $tenses[] = $tense;
        }
        return $tenses;
    }

    private function getTensesParameter()
    {   
        return $this->getSessionParameter('tenses', $this->getTensesArray(true));
    }

}