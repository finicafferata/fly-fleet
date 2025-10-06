'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import { AirportSearch } from './AirportSearch';
import { FormField } from './ui/FormField';
import { FocusRing } from './ui/FocusRing';
import { LiveRegion } from './ui/LiveRegion';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { trackFormStart, trackFormSubmitQuote } from '../lib/analytics/accessibleTracking';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  isPopular: boolean;
}

// Complete country codes list with flags, unique ISO codes, and localized names
const allCountryCodes = [
  { code: '+93', country: { en: 'Afghanistan', es: 'Afganistán', pt: 'Afeganistão' }, flag: '🇦🇫', iso: 'AF' },
  { code: '+355', country: { en: 'Albania', es: 'Albania', pt: 'Albânia' }, flag: '🇦🇱', iso: 'AL' },
  { code: '+213', country: { en: 'Algeria', es: 'Argelia', pt: 'Argélia' }, flag: '🇩🇿', iso: 'DZ' },
  { code: '+1684', country: { en: 'American Samoa', es: 'Samoa Americana', pt: 'Samoa Americana' }, flag: '🇦🇸', iso: 'AS' },
  { code: '+376', country: { en: 'Andorra', es: 'Andorra', pt: 'Andorra' }, flag: '🇦🇩', iso: 'AD' },
  { code: '+244', country: { en: 'Angola', es: 'Angola', pt: 'Angola' }, flag: '🇦🇴', iso: 'AO' },
  { code: '+1264', country: { en: 'Anguilla', es: 'Anguila', pt: 'Anguilla' }, flag: '🇦🇮', iso: 'AI' },
  { code: '+1268', country: { en: 'Antigua and Barbuda', es: 'Antigua y Barbuda', pt: 'Antígua e Barbuda' }, flag: '🇦🇬', iso: 'AG' },
  { code: '+54', country: { en: 'Argentina', es: 'Argentina', pt: 'Argentina' }, flag: '🇦🇷', iso: 'AR' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', iso: 'AM' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼', iso: 'AW' },
  { code: '+61', country: { en: 'Australia', es: 'Australia', pt: 'Austrália' }, flag: '🇦🇺', iso: 'AU' },
  { code: '+43', country: { en: 'Austria', es: 'Austria', pt: 'Áustria' }, flag: '🇦🇹', iso: 'AT' },
  { code: '+994', country: { en: 'Azerbaijan', es: 'Azerbaiyán', pt: 'Azerbaijão' }, flag: '🇦🇿', iso: 'AZ' },
  { code: '+1242', country: { en: 'Bahamas', es: 'Bahamas', pt: 'Bahamas' }, flag: '🇧🇸', iso: 'BS' },
  { code: '+973', country: { en: 'Bahrain', es: 'Baréin', pt: 'Bahrein' }, flag: '🇧🇭', iso: 'BH' },
  { code: '+880', country: { en: 'Bangladesh', es: 'Bangladés', pt: 'Bangladesh' }, flag: '🇧🇩', iso: 'BD' },
  { code: '+1246', country: { en: 'Barbados', es: 'Barbados', pt: 'Barbados' }, flag: '🇧🇧', iso: 'BB' },
  { code: '+375', country: { en: 'Belarus', es: 'Bielorrusia', pt: 'Bielorrússia' }, flag: '🇧🇾', iso: 'BY' },
  { code: '+32', country: { en: 'Belgium', es: 'Bélgica', pt: 'Bélgica' }, flag: '🇧🇪', iso: 'BE' },
  { code: '+501', country: 'Belize', flag: '🇧🇿', iso: 'BZ' },
  { code: '+229', country: 'Benin', flag: '🇧🇯', iso: 'BJ' },
  { code: '+1441', country: 'Bermuda', flag: '🇧🇲', iso: 'BM' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹', iso: 'BT' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'BO' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', iso: 'BA' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼', iso: 'BW' },
  { code: '+55', country: { en: 'Brazil', es: 'Brasil', pt: 'Brasil' }, flag: '🇧🇷', iso: 'BR' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳', iso: 'BN' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬', iso: 'BG' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', iso: 'BF' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮', iso: 'BI' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭', iso: 'KH' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲', iso: 'CM' },
  { code: '+1', country: { en: 'Canada', es: 'Canadá', pt: 'Canadá' }, flag: '🇨🇦', iso: 'CA' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻', iso: 'CV' },
  { code: '+1345', country: 'Cayman Islands', flag: '🇰🇾', iso: 'KY' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫', iso: 'CF' },
  { code: '+235', country: 'Chad', flag: '🇹🇩', iso: 'TD' },
  { code: '+56', country: { en: 'Chile', es: 'Chile', pt: 'Chile' }, flag: '🇨🇱', iso: 'CL' },
  { code: '+86', country: { en: 'China', es: 'China', pt: 'China' }, flag: '🇨🇳', iso: 'CN' },
  { code: '+57', country: { en: 'Colombia', es: 'Colombia', pt: 'Colômbia' }, flag: '🇨🇴', iso: 'CO' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲', iso: 'KM' },
  { code: '+242', country: 'Congo', flag: '🇨🇬', iso: 'CG' },
  { code: '+243', country: 'Congo (Democratic Republic)', flag: '🇨🇩', iso: 'CD' },
  { code: '+682', country: 'Cook Islands', flag: '🇨🇰', iso: 'CK' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷', iso: 'CR' },
  { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮', iso: 'CI' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', iso: 'HR' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺', iso: 'CU' },
  { code: '+599', country: 'Curaçao', flag: '🇨🇼', iso: 'CW' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾', iso: 'CY' },
  { code: '+420', country: { en: 'Czech Republic', es: 'República Checa', pt: 'República Tcheca' }, flag: '🇨🇿', iso: 'CZ' },
  { code: '+45', country: { en: 'Denmark', es: 'Dinamarca', pt: 'Dinamarca' }, flag: '🇩🇰', iso: 'DK' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯', iso: 'DJ' },
  { code: '+1767', country: 'Dominica', flag: '🇩🇲', iso: 'DM' },
  { code: '+1809', country: { en: 'Dominican Republic', es: 'República Dominicana', pt: 'República Dominicana' }, flag: '🇩🇴', iso: 'DO' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨', iso: 'EC' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻', iso: 'SV' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶', iso: 'GQ' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷', iso: 'ER' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', iso: 'EE' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹', iso: 'ET' },
  { code: '+500', country: 'Falkland Islands', flag: '🇫🇰', iso: 'FK' },
  { code: '+298', country: 'Faroe Islands', flag: '🇫🇴', iso: 'FO' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯', iso: 'FJ' },
  { code: '+358', country: { en: 'Finland', es: 'Finlandia', pt: 'Finlândia' }, flag: '🇫🇮', iso: 'FI' },
  { code: '+33', country: { en: 'France', es: 'Francia', pt: 'França' }, flag: '🇫🇷', iso: 'FR' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫', iso: 'GF' },
  { code: '+689', country: 'French Polynesia', flag: '🇵🇫', iso: 'PF' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦', iso: 'GA' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲', iso: 'GM' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', iso: 'GE' },
  { code: '+49', country: { en: 'Germany', es: 'Alemania', pt: 'Alemanha' }, flag: '🇩🇪', iso: 'DE' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', iso: 'GH' },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮', iso: 'GI' },
  { code: '+30', country: { en: 'Greece', es: 'Grecia', pt: 'Grécia' }, flag: '🇬🇷', iso: 'GR' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱', iso: 'GL' },
  { code: '+1473', country: 'Grenada', flag: '🇬🇩', iso: 'GD' },
  { code: '+590', country: 'Guadeloupe', flag: '🇬🇵', iso: 'GP' },
  { code: '+1671', country: 'Guam', flag: '🇬🇺', iso: 'GU' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹', iso: 'GT' },
  { code: '+44', country: 'Guernsey', flag: '🇬🇬', iso: 'GG' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳', iso: 'GN' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼', iso: 'GW' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾', iso: 'GY' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹', iso: 'HT' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳', iso: 'HN' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', iso: 'HK' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', iso: 'HU' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', iso: 'IS' },
  { code: '+91', country: { en: 'India', es: 'India', pt: 'Índia' }, flag: '🇮🇳', iso: 'IN' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', iso: 'IR' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶', iso: 'IQ' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
  { code: '+44', country: 'Isle of Man', flag: '🇮🇲', iso: 'IM' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', iso: 'IL' },
  { code: '+39', country: { en: 'Italy', es: 'Italia', pt: 'Itália' }, flag: '🇮🇹', iso: 'IT' },
  { code: '+1876', country: 'Jamaica', flag: '🇯🇲', iso: 'JM' },
  { code: '+81', country: { en: 'Japan', es: 'Japón', pt: 'Japão' }, flag: '🇯🇵', iso: 'JP' },
  { code: '+44', country: 'Jersey', flag: '🇯🇪', iso: 'JE' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', iso: 'JO' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', iso: 'KZ' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮', iso: 'KI' },
  { code: '+850', country: 'Korea (North)', flag: '🇰🇵', iso: 'KP' },
  { code: '+82', country: 'Korea (South)', flag: '🇰🇷', iso: 'KR' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', iso: 'KG' },
  { code: '+856', country: 'Laos', flag: '🇱🇦', iso: 'LA' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻', iso: 'LV' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', iso: 'LB' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸', iso: 'LS' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷', iso: 'LR' },
  { code: '+218', country: 'Libya', flag: '🇱🇾', iso: 'LY' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', iso: 'LI' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹', iso: 'LT' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺', iso: 'LU' },
  { code: '+853', country: 'Macao', flag: '🇲🇴', iso: 'MO' },
  { code: '+389', country: 'Macedonia', flag: '🇲🇰', iso: 'MK' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬', iso: 'MG' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼', iso: 'MW' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻', iso: 'MV' },
  { code: '+223', country: 'Mali', flag: '🇲🇱', iso: 'ML' },
  { code: '+356', country: 'Malta', flag: '🇲🇹', iso: 'MT' },
  { code: '+692', country: 'Marshall Islands', flag: '🇲🇭', iso: 'MH' },
  { code: '+596', country: 'Martinique', flag: '🇲🇶', iso: 'MQ' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷', iso: 'MR' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺', iso: 'MU' },
  { code: '+262', country: 'Mayotte', flag: '🇾🇹', iso: 'YT' },
  { code: '+52', country: { en: 'Mexico', es: 'México', pt: 'México' }, flag: '🇲🇽', iso: 'MX' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲', iso: 'FM' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩', iso: 'MD' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨', iso: 'MC' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳', iso: 'MN' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪', iso: 'ME' },
  { code: '+1664', country: 'Montserrat', flag: '🇲🇸', iso: 'MS' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', iso: 'MA' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿', iso: 'MZ' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', iso: 'MM' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦', iso: 'NA' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷', iso: 'NR' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP' },
  { code: '+31', country: { en: 'Netherlands', es: 'Países Bajos', pt: 'Países Baixos' }, flag: '🇳🇱', iso: 'NL' },
  { code: '+687', country: 'New Caledonia', flag: '🇳🇨', iso: 'NC' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮', iso: 'NI' },
  { code: '+227', country: 'Niger', flag: '🇳🇪', iso: 'NE' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '+683', country: 'Niue', flag: '🇳🇺', iso: 'NU' },
  { code: '+672', country: 'Norfolk Island', flag: '🇳🇫', iso: 'NF' },
  { code: '+1670', country: 'Northern Mariana Islands', flag: '🇲🇵', iso: 'MP' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
  { code: '+680', country: 'Palau', flag: '🇵🇼', iso: 'PW' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸', iso: 'PS' },
  { code: '+507', country: { en: 'Panama', es: 'Panamá', pt: 'Panamá' }, flag: '🇵🇦', iso: 'PA' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', iso: 'PG' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'PY' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', iso: 'PE' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', iso: 'PL' },
  { code: '+351', country: { en: 'Portugal', es: 'Portugal', pt: 'Portugal' }, flag: '🇵🇹', iso: 'PT' },
  { code: '+1787', country: 'Puerto Rico', flag: '🇵🇷', iso: 'PR' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+262', country: 'Réunion', flag: '🇷🇪', iso: 'RE' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', iso: 'RO' },
  { code: '+7', country: { en: 'Russia', es: 'Rusia', pt: 'Rússia' }, flag: '🇷🇺', iso: 'RU' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼', iso: 'RW' },
  { code: '+590', country: 'Saint Barthélemy', flag: '🇧🇱', iso: 'BL' },
  { code: '+290', country: 'Saint Helena', flag: '🇸🇭', iso: 'SH' },
  { code: '+1869', country: 'Saint Kitts and Nevis', flag: '🇰🇳', iso: 'KN' },
  { code: '+1758', country: 'Saint Lucia', flag: '🇱🇨', iso: 'LC' },
  { code: '+590', country: 'Saint Martin', flag: '🇲🇫', iso: 'MF' },
  { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲', iso: 'PM' },
  { code: '+1784', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨', iso: 'VC' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸', iso: 'WS' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲', iso: 'SM' },
  { code: '+239', country: 'São Tomé and Príncipe', flag: '🇸🇹', iso: 'ST' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳', iso: 'SN' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸', iso: 'RS' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨', iso: 'SC' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱', iso: 'SL' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+1721', country: 'Sint Maarten', flag: '🇸🇽', iso: 'SX' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', iso: 'SK' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', iso: 'SI' },
  { code: '+677', country: 'Solomon Islands', flag: '🇸🇧', iso: 'SB' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴', iso: 'SO' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸', iso: 'SS' },
  { code: '+34', country: { en: 'Spain', es: 'España', pt: 'Espanha' }, flag: '🇪🇸', iso: 'ES' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩', iso: 'SD' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷', iso: 'SR' },
  { code: '+47', country: 'Svalbard and Jan Mayen', flag: '🇸🇯', iso: 'SJ' },
  { code: '+268', country: 'Swaziland', flag: '🇸🇿', iso: 'SZ' },
  { code: '+46', country: { en: 'Sweden', es: 'Suecia', pt: 'Suécia' }, flag: '🇸🇪', iso: 'SE' },
  { code: '+41', country: { en: 'Switzerland', es: 'Suiza', pt: 'Suíça' }, flag: '🇨🇭', iso: 'CH' },
  { code: '+963', country: 'Syria', flag: '🇸🇾', iso: 'SY' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', iso: 'TW' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯', iso: 'TJ' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿', iso: 'TZ' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH' },
  { code: '+670', country: 'Timor-Leste', flag: '🇹🇱', iso: 'TL' },
  { code: '+228', country: 'Togo', flag: '🇹🇬', iso: 'TG' },
  { code: '+690', country: 'Tokelau', flag: '🇹🇰', iso: 'TK' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴', iso: 'TO' },
  { code: '+1868', country: 'Trinidad and Tobago', flag: '🇹🇹', iso: 'TT' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳', iso: 'TN' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', iso: 'TR' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', iso: 'TM' },
  { code: '+1649', country: 'Turks and Caicos Islands', flag: '🇹🇨', iso: 'TC' },
  { code: '+688', country: 'Tuvalu', flag: '🇹🇻', iso: 'TV' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', iso: 'UG' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', iso: 'UA' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
  { code: '+44', country: { en: 'United Kingdom', es: 'Reino Unido', pt: 'Reino Unido' }, flag: '🇬🇧', iso: 'GB' },
  { code: '+1', country: { en: 'United States', es: 'Estados Unidos', pt: 'Estados Unidos' }, flag: '🇺🇸', iso: 'US' },
  { code: '+598', country: { en: 'Uruguay', es: 'Uruguay', pt: 'Uruguai' }, flag: '🇺🇾', iso: 'UY' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', iso: 'UZ' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺', iso: 'VU' },
  { code: '+39', country: 'Vatican City', flag: '🇻🇦', iso: 'VA' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', iso: 'VE' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN' },
  { code: '+1284', country: 'British Virgin Islands', flag: '🇻🇬', iso: 'VG' },
  { code: '+1340', country: 'U.S. Virgin Islands', flag: '🇻🇮', iso: 'VI' },
  { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫', iso: 'WF' },
  { code: '+212', country: 'Western Sahara', flag: '🇪🇭', iso: 'EH' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪', iso: 'YE' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲', iso: 'ZM' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', iso: 'ZW' },
];

// Helper function to get localized country name
const getLocalizedCountryName = (country: any, locale: string = 'en') => {
  if (typeof country === 'string') {
    return country;
  }
  return country[locale as keyof typeof country] || country.en || country;
};

// Function to get country codes with priority countries first, then alphabetical
const getOrderedCountryCodes = (locale: string = 'en') => {
  // Priority countries in the specified order
  const priorityIsos = ['AR', 'BR', 'CL', 'CO', 'MX', 'PA', 'UY', 'US'];

  // Find priority countries
  const priorityCountries = priorityIsos.map(iso =>
    allCountryCodes.find(country => country.iso === iso)
  ).filter(Boolean);

  // Get remaining countries (exclude priority countries) and sort alphabetically by localized name
  const remainingCountries = allCountryCodes.filter(
    country => !priorityIsos.includes(country.iso)
  ).sort((a, b) => {
    const nameA = getLocalizedCountryName(a.country, locale);
    const nameB = getLocalizedCountryName(b.country, locale);
    return nameA.localeCompare(nameB);
  });

  // Create separator object
  const separator = {
    code: '',
    country: '────────────────────────',
    flag: '',
    iso: 'SEPARATOR',
    isSeparator: true
  };

  // Combine: priority countries + separator + alphabetical remaining countries
  return [...priorityCountries, separator, ...remainingCountries];
};

// countryCodes will be defined inside the component to access locale

// Generate time options (full hours and half hours only)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    times.push({ value: `${hourStr}:00`, label: `${hourStr}:00` });
    times.push({ value: `${hourStr}:30`, label: `${hourStr}:30` });
  }
  return times;
};

const timeOptions = generateTimeOptions();

// Step validation schemas
const step1Schema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  serviceTypeOther: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  contactWhatsApp: z.boolean().optional(),
}).refine((data) => {
  if (data.serviceType === 'other') {
    return data.serviceTypeOther && data.serviceTypeOther.trim().length > 0;
  }
  return true;
}, {
  message: 'Please specify the service type',
  path: ['serviceTypeOther']
});

const step2Schema = z.object({
  departureAirport: z.object({
    code: z.string().min(1, 'Departure airport is required'),
    name: z.string(),
    city: z.string(),
    country: z.string()
  }),
  arrivalAirport: z.object({
    code: z.string().min(1, 'Arrival airport is required'),
    name: z.string(),
    city: z.string(),
    country: z.string()
  }),
  departureDate: z.string().min(1, 'Departure date is required'),
  departureTime: z.string().optional().refine(
    (val) => !val || /^([0-1]?[0-9]|2[0-3]):(00|30)$/.test(val),
    'Please enter full or half hour (e.g., 14:00 or 14:30)'
  ),
  passengers: z.number().min(1, 'At least 1 passenger required').max(50, 'Maximum 50 passengers'),
});

const step3Schema = z.object({
  lightBaggage: z.number().min(0).max(20).default(0),
  mediumBaggage: z.number().min(0).max(20).default(0),
  largeBaggage: z.number().min(0).max(20).default(0),
  specialItems: z.string().optional(),
  pets: z.boolean().default(false),
  petSpecies: z.string().optional(),
  petSize: z.string().optional(),
  petDocumentation: z.boolean().default(false),
  additionalServices: z.array(z.string()).optional(),
  message: z.string().optional(),
  privacyConsent: z.boolean().refine(val => val === true, 'Privacy consent is required'),
});

const fullFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type QuoteFormData = z.infer<typeof fullFormSchema>;

interface QuoteFormProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: string) => void;
  detectedCountryCode?: string;
}

const serviceTypeOptions = [
  { value: 'charter', label: 'Private Charter', description: 'Exclusive private flights' },
  { value: 'empty_legs', label: 'Empty Legs', description: 'Discounted repositioning flights' },
  { value: 'multicity', label: 'Multi-City', description: 'Multiple destination trips' },
  { value: 'helicopter', label: 'Helicopter', description: 'Helicopter charter services' },
  { value: 'medical', label: 'Medical', description: 'Emergency medical transport' },
  { value: 'cargo', label: 'Cargo', description: 'Freight and cargo transport' }
];

const getBaggageSizeOptions = (locale: string) => [
  {
    value: 'light',
    label: locale === 'es' ? 'Liviano' : locale === 'pt' ? 'Leve' : 'Light'
  },
  {
    value: 'medium',
    label: locale === 'es' ? 'Mediano' : locale === 'pt' ? 'Médio' : 'Medium'
  },
  {
    value: 'large',
    label: locale === 'es' ? 'Grande' : locale === 'pt' ? 'Grande' : 'Large'
  }
];

const getPetSpeciesOptions = (locale: string) => [
  {
    value: 'dog',
    label: locale === 'es' ? 'Perro' : locale === 'pt' ? 'Cachorro' : 'Dog'
  },
  {
    value: 'cat',
    label: locale === 'es' ? 'Gato' : locale === 'pt' ? 'Gato' : 'Cat'
  },
  {
    value: 'other',
    label: locale === 'es' ? 'Otro' : locale === 'pt' ? 'Outro' : 'Other'
  }
];

const getPetSizeOptions = (locale: string) => [
  {
    value: 'light',
    label: locale === 'es' ? 'Liviano' : locale === 'pt' ? 'Leve' : 'Light'
  },
  {
    value: 'medium',
    label: locale === 'es' ? 'Mediano' : locale === 'pt' ? 'Médio' : 'Medium'
  },
  {
    value: 'heavy',
    label: locale === 'es' ? 'Pesado' : locale === 'pt' ? 'Pesado' : 'Heavy'
  }
];

const getAdditionalServicesOptions = (locale: string) => [
  {
    value: 'international_support',
    label: locale === 'es' ? 'Apoyo vuelos internacionales' : locale === 'pt' ? 'Suporte voos internacionais' : 'International Flight Support'
  },
  {
    value: 'country_documentation',
    label: locale === 'es' ? 'Documentación por país' : locale === 'pt' ? 'Documentação por país' : 'Country Documentation'
  },
  {
    value: 'pet_friendly_transport',
    label: locale === 'es' ? 'Transporte pet-friendly' : locale === 'pt' ? 'Transporte pet-friendly' : 'Pet-Friendly Transport'
  },
  {
    value: 'ground_transfer_driver',
    label: locale === 'es' ? 'Transfer terrestre / chofer' : locale === 'pt' ? 'Transfer terrestre / motorista' : 'Ground Transfer / Driver'
  },
  {
    value: 'premium_catering',
    label: locale === 'es' ? 'Catering premium' : locale === 'pt' ? 'Catering premium' : 'Premium Catering'
  },
  {
    value: 'vip_lounge_fbo',
    label: locale === 'es' ? 'Sala VIP / FBO específico' : locale === 'pt' ? 'Sala VIP / FBO específico' : 'VIP Lounge / Specific FBO'
  },
  {
    value: 'customs_immigration_assist',
    label: locale === 'es' ? 'Asistencia migraciones/aduana' : locale === 'pt' ? 'Assistência migração/alfândega' : 'Customs/Immigration Assistance'
  }
];

// Auto-detect country code based on IP (mock function)
const detectCountryCode = (): string => {
  // In real implementation, this would use IP geolocation
  // For now, defaulting to Argentina as per user request
  return '+54';
};

const getContent = (locale: string) => {
  const content = {
    en: {
      step1Title: 'Personal Information',
      step2Title: 'Flight Details',
      step3Title: 'Service & Preferences',
      nextButton: 'Next',
      prevButton: 'Previous',
      submitButton: 'Request Quote',
      serviceType: 'Service Type',
      serviceTypeOther: 'Please specify',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      contactWhatsApp: 'Contact me via WhatsApp',
      countryCode: 'Country',
      from: 'From',
      to: 'To',
      fromPlaceholder: 'City or Airport',
      toPlaceholder: 'City or Airport',
      departureDate: 'Departure Date',
      departureTime: 'Departure Time',
      serviceType: 'Service Type',
      passengers: 'Number of Passengers',
      carryOnBags: 'Carry-on bags',
      checkedBags: 'Checked bags',
      oversizedBags: 'Oversized/Special bags',
      specialItems: 'Special Items',
      pets: 'Travel with pets?',
      petSpecies: 'Pet Type/Species',
      petSize: 'Pet Size',
      petDocumentation: 'I have required pet travel documents',
      additionalServices: 'Additional Services',
      message: 'Additional Comments or Special Requests',
      privacyConsent: 'I agree to the Privacy Policy and consent to the processing of my personal data for quote purposes.',
    },
    es: {
      step1Title: 'Información Personal',
      step2Title: 'Detalles del Vuelo',
      step3Title: 'Servicio y Preferencias',
      nextButton: 'Siguiente',
      prevButton: 'Anterior',
      submitButton: 'Solicitar Cotización',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      contactWhatsApp: 'Contactar por WhatsApp',
      countryCode: 'País',
      from: 'Desde',
      to: 'Hasta',
      fromPlaceholder: 'Ciudad o Aeropuerto',
      toPlaceholder: 'Ciudad o Aeropuerto',
      departureDate: 'Fecha de Salida',
      departureTime: 'Hora de Salida',
      serviceType: 'Tipo de Servicio',
      serviceTypeOther: 'Por favor especificar',
      passengers: 'Número de Pasajeros',
      carryOnBags: 'Equipaje de mano',
      checkedBags: 'Equipaje facturado',
      oversizedBags: 'Equipaje especial/Sobredimensionado',
      specialItems: 'Artículos Especiales',
      pets: '¿Viajar con mascotas?',
      petSpecies: 'Tipo/Especie de Mascota',
      petSize: 'Tamaño de Mascota',
      petDocumentation: 'Tengo documentación requerida para viaje de mascotas',
      additionalServices: 'Servicios Adicionales',
      message: 'Comentarios Adicionales o Solicitudes Especiales',
      privacyConsent: 'Acepto la Política de Privacidad y consiento el procesamiento de mis datos personales para fines de cotización.',
    },
    pt: {
      step1Title: 'Informações Pessoais',
      step2Title: 'Detalhes do Voo',
      step3Title: 'Serviço e Preferências',
      nextButton: 'Próximo',
      prevButton: 'Anterior',
      submitButton: 'Solicitar Cotação',
      firstName: 'Nome',
      lastName: 'Sobrenome',
      email: 'Email',
      phone: 'Telefone',
      contactWhatsApp: 'Contatar via WhatsApp',
      countryCode: 'País',
      from: 'De',
      to: 'Para',
      fromPlaceholder: 'Cidade ou Aeroporto',
      toPlaceholder: 'Cidade ou Aeroporto',
      departureDate: 'Data de Partida',
      departureTime: 'Hora de Partida',
      serviceType: 'Tipo de Serviço',
      serviceTypeOther: 'Por favor especificar',
      passengers: 'Número de Passageiros',
      carryOnBags: 'Bagagem de mão',
      checkedBags: 'Bagagem despachada',
      oversizedBags: 'Bagagem especial/Grande',
      specialItems: 'Itens Especiais',
      pets: 'Viajar com animais de estimação?',
      petSpecies: 'Tipo/Espécie do Animal',
      petSize: 'Tamanho do Animal',
      petDocumentation: 'Tenho documentação necessária para viagem de animais',
      additionalServices: 'Serviços Adicionais',
      message: 'Comentários Adicionais ou Solicitações Especiais',
      privacyConsent: 'Concordo com a Política de Privacidade e consinto com o processamento dos meus dados pessoais para fins de cotação.',
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export function QuoteForm({
  locale = 'en',
  className = '',
  onSubmitSuccess,
  onSubmitError,
  detectedCountryCode
}: QuoteFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [announcement, setAnnouncement] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [showPetSection, setShowPetSection] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [autoDetectedCountryCode, setAutoDetectedCountryCode] = useState('');

  const content = getContent(locale);
  const countryCodes = getOrderedCountryCodes(locale);
  const { announce } = useAnnouncer();
  const { focusElement } = useFocusManagement();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset
  } = useForm<QuoteFormData>({
    resolver: zodResolver(fullFormSchema),
    mode: 'onBlur',
    defaultValues: {
      serviceType: 'charter',
      passengers: 1,
      lightBaggage: 0,
      mediumBaggage: 0,
      largeBaggage: 0,
      pets: false,
      privacyConsent: false,
      contactWhatsApp: false,
      petDocumentation: false,
      countryCode: detectedCountryCode || detectCountryCode()
    }
  });

  // Auto-detect country code on mount
  useEffect(() => {
    const detected = detectedCountryCode || detectCountryCode();
    setAutoDetectedCountryCode(detected);
    setValue('countryCode', detected);
  }, [detectedCountryCode, setValue]);

  const watchedValues = watch();
  const pets = watch('pets');

  // Show/hide pet section
  useEffect(() => {
    setShowPetSection(pets);
    if (!pets) {
      setValue('petSpecies', '');
      setValue('petSize', '');
    }
  }, [pets, setValue]);

  // Validate current step
  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof QuoteFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'countryCode', 'phone'];
        break;
      case 2:
        fieldsToValidate = ['departureAirport', 'arrivalAirport', 'departureDate', 'passengers'];
        break;
      case 3:
        fieldsToValidate = ['privacyConsent'];
        break;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return watchedValues.firstName &&
               watchedValues.lastName &&
               watchedValues.email &&
               watchedValues.countryCode &&
               watchedValues.phone &&
               !errors.firstName &&
               !errors.lastName &&
               !errors.email &&
               !errors.countryCode &&
               !errors.phone;
      case 2:
        return watchedValues.departureAirport?.code &&
               watchedValues.arrivalAirport?.code &&
               watchedValues.departureDate &&
               watchedValues.passengers &&
               !errors.departureAirport &&
               !errors.arrivalAirport &&
               !errors.departureDate &&
               !errors.passengers;
      case 3:
        return watchedValues.privacyConsent &&
               !errors.privacyConsent;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      announce(`Step ${currentStep + 1}: ${getStepTitle(currentStep + 1)}`, { priority: 'polite' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      announce(`Step ${currentStep - 1}: ${getStepTitle(currentStep - 1)}`, { priority: 'polite' });
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return content.step1Title;
      case 2: return content.step2Title;
      case 3: return content.step3Title;
      default: return '';
    }
  };

  const handleDepartureSelect = useCallback((airport: Airport) => {
    setValue('departureAirport', {
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country
    }, { shouldValidate: true });
    announce(`Departure airport selected: ${airport.code} - ${airport.name}`, { priority: 'polite' });
  }, [setValue, announce]);

  const handleArrivalSelect = useCallback((airport: Airport) => {
    setValue('arrivalAirport', {
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country
    }, { shouldValidate: true });
    announce(`Arrival airport selected: ${airport.code} - ${airport.name}`, { priority: 'polite' });
  }, [setValue, announce]);

  const onSubmit = useCallback(async (data: QuoteFormData) => {
    console.log('=== FORM SUBMIT TRIGGERED ===');
    console.log('Form Data:', data);
    console.log('reCAPTCHA Token:', recaptchaToken);

    if (!recaptchaToken) {
      console.log('ERROR: No reCAPTCHA token');
      announce('Please complete the verification before submitting', 'assertive');
      return;
    }

    console.log('Proceeding with submission...');
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setAnnouncement('Submitting quote request...');

    try {
      console.log('Sending POST to /api/quote');

      // Transform form data to match API schema
      const apiPayload = {
        service: data.serviceType,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.countryCode + data.phone,
        passengers: data.passengers,
        origin: data.departureAirport.code,
        destination: data.arrivalAirport.code,
        date: data.departureDate,
        time: data.departureTime || '00:00',
        standardBagsCount: (data.lightBaggage || 0) + (data.mediumBaggage || 0) + (data.largeBaggage || 0),
        specialItems: data.specialItems,
        pets: data.pets,
        petSpecies: data.petSpecies,
        petSize: data.petSize,
        petDocuments: data.petDocumentation,
        additionalServices: data.additionalServices || [],
        comments: data.message,
        privacyConsent: data.privacyConsent,
        contactWhatsApp: data.contactWhatsApp || false,
        recaptchaToken,
        locale
      };

      console.log('Transformed API Payload:', apiPayload);

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        console.error('API Error Response:', result);
        throw new Error(result.message || 'Submission failed');
      }

      console.log('SUCCESS: Quote submitted');
      setSubmitStatus('success');
      setAnnouncement('Quote request submitted successfully');
      reset();
      setRecaptchaToken('');
      onSubmitSuccess?.(result);

    } catch (error) {
      console.error('Quote submission error:', error);
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request';
      setAnnouncement(`Error: ${errorMessage}`);
      announce(errorMessage, 'assertive');
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [recaptchaToken, locale, reset, announce, onSubmitSuccess, onSubmitError]);

  return (
    <div className={clsx('max-w-4xl mx-auto', className)}>
      {/* Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative">
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200 relative z-10',
                    step === currentStep
                      ? 'bg-accent-blue text-white border-accent-blue shadow-lg'
                      : step < currentStep
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-500 border-gray-300'
                  )}
                  aria-label={`Step ${step}: ${getStepTitle(step)}`}
                >
                  {step < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className={clsx(
                  'mt-2 text-xs font-medium text-center max-w-20',
                  step === currentStep ? 'text-accent-blue' : 'text-gray-500'
                )}>
                  {getStepTitle(step)}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={clsx(
                    'h-0.5 transition-all duration-200 flex-1 mx-4',
                    'relative top-[-21px]', // Move up to center with circles
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-base font-medium text-navy-primary">
            {getStepTitle(currentStep)}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('=== VALIDATION ERRORS ===');
        console.log('Form validation failed:', errors);
      })} noValidate>
        <fieldset disabled={isSubmitting}>
          <legend className="sr-only">Quote Request Form - Step {currentStep}</legend>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Service Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-navy-primary mb-2">
                  {content.serviceType} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('serviceType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                >
                  <option value="">-- {locale === 'es' ? 'Seleccionar' : locale === 'pt' ? 'Selecionar' : 'Select'} --</option>
                  <option value="charter">{locale === 'es' ? 'Charter punto a punto' : locale === 'pt' ? 'Charter ponto a ponto' : 'Charter point-to-point'}</option>
                  <option value="empty_legs">{locale === 'es' ? 'Empty legs' : locale === 'pt' ? 'Empty legs' : 'Empty legs'}</option>
                  <option value="multicity">{locale === 'es' ? 'Multi-ciudad' : locale === 'pt' ? 'Multi-cidade' : 'Multi-city'}</option>
                  <option value="helicopter">{locale === 'es' ? 'Helicóptero' : locale === 'pt' ? 'Helicóptero' : 'Helicopter'}</option>
                  <option value="medical">{locale === 'es' ? 'Médico' : locale === 'pt' ? 'Médico' : 'Medical'}</option>
                  <option value="cargo">{locale === 'es' ? 'Carga' : locale === 'pt' ? 'Carga' : 'Cargo'}</option>
                  <option value="other">{locale === 'es' ? 'Otros' : locale === 'pt' ? 'Outros' : 'Other'}</option>
                </select>
                {errors.serviceType && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>
                )}
              </div>

              {/* Show "Other" text input when "Other" is selected */}
              {watch('serviceType') === 'other' && (
                <div>
                  <Input
                    {...register('serviceTypeOther')}
                    label={content.serviceTypeOther}
                    error={errors.serviceTypeOther?.message}
                    type="text"
                    placeholder=""
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...register('firstName')}
                  label={content.firstName}
                  required
                  error={errors.firstName?.message}
                  type="text"
                  autoComplete="given-name"
                />

                <Input
                  {...register('lastName')}
                  label={content.lastName}
                  required
                  error={errors.lastName?.message}
                  type="text"
                  autoComplete="family-name"
                />
              </div>

              <Input
                {...register('email')}
                label={content.email}
                required
                error={errors.email?.message}
                type="email"
                autoComplete="email"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-primary mb-2">
                    {content.countryCode} <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('countryCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    required
                  >
                    {countryCodes.map((country) => (
                      <option
                        key={country.iso}
                        value={country.code}
                        disabled={country.isSeparator}
                        style={country.isSeparator ? {
                          color: '#9CA3AF',
                          fontWeight: 'normal',
                          fontSize: '12px',
                          textAlign: 'center' as const
                        } : undefined}
                      >
                        {country.isSeparator ? country.country : `${country.flag} ${country.code} - ${getLocalizedCountryName(country.country, locale)}`}
                      </option>
                    ))}
                  </select>
                  {errors.countryCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.countryCode.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Input
                    {...register('phone')}
                    label={content.phone}
                    required
                    error={errors.phone?.message}
                    type="tel"
                    autoComplete="tel"
                    placeholder="1234567890"
                  />

                  {/* WhatsApp Checkbox */}
                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        {...register('contactWhatsApp')}
                        type="checkbox"
                        className="w-4 h-4 text-accent-blue border-gray-300 rounded focus:ring-2 focus:ring-accent-blue"
                      />
                      <span className="text-sm text-gray-600">
                        {content.contactWhatsApp}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Flight Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-primary mb-2">
                    {content.from} <span className="text-red-500">*</span>
                  </label>
                  <AirportSearch
                    onSelect={handleDepartureSelect}
                    placeholder={content.fromPlaceholder}
                    locale={locale}
                    error={errors.departureAirport?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-primary mb-2">
                    {content.to} <span className="text-red-500">*</span>
                  </label>
                  <AirportSearch
                    onSelect={handleArrivalSelect}
                    placeholder={content.toPlaceholder}
                    locale={locale}
                    error={errors.arrivalAirport?.message}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-primary mb-2">
                    {content.departureDate} <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('departureDate')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue cursor-pointer min-h-[44px]"
                    required
                    style={{
                      colorScheme: 'light',
                      position: 'relative',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                    onClick={(e) => {
                      // Ensure the date picker opens when clicking anywhere on the field
                      const input = e.target as HTMLInputElement;
                      input.showPicker?.();
                    }}
                  />
                  {errors.departureDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.departureDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-primary mb-2">
                    {content.departureTime}
                  </label>
                  <input
                    {...register('departureTime')}
                    type="text"
                    placeholder={locale === 'es' ? 'Ej: 14:00 o 14:30' : locale === 'pt' ? 'Ex: 14:00 ou 14:30' : 'e.g., 14:00 or 14:30'}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[44px]"
                    pattern="^([0-1]?[0-9]|2[0-3]):(00|30)$"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      let value = target.value.replace(/[^0-9:]/g, '');

                      // Auto-add colon after 2 digits
                      if (value.length === 2 && !value.includes(':')) {
                        value = value + ':';
                      }

                      // Limit length to 5 characters (HH:MM)
                      if (value.length > 5) {
                        value = value.slice(0, 5);
                      }

                      target.value = value;
                      setValue('departureTime', value);
                    }}
                  />
                  {errors.departureTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {locale === 'es' ? 'Por favor ingrese hora completa o media hora (ej: 14:00 o 14:30)' :
                       locale === 'pt' ? 'Por favor digite hora cheia ou meia hora (ex: 14:00 ou 14:30)' :
                       'Please enter full or half hour (e.g., 14:00 or 14:30)'}
                    </p>
                  )}
                </div>
              </div>

              {/* Number of Passengers */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-navy-primary mb-2">
                  {content.passengers} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <button
                    type="button"
                    onClick={() => {
                      const current = watchedValues.passengers || 1;
                      const newValue = Math.max(current - 1, 1);
                      setValue('passengers', newValue, { shouldValidate: true });
                    }}
                    disabled={watchedValues.passengers <= 1}
                    className="w-8 h-8 rounded-full bg-white border-2 border-accent-blue text-accent-blue font-bold text-sm hover:bg-accent-blue hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-1"
                  >
                    −
                  </button>
                  <div className="min-w-[80px] text-center">
                    <div className="text-lg font-bold text-navy-primary">
                      {watchedValues.passengers || 1}
                    </div>
                    <div className="text-xs text-gray-600">
                      {locale === 'es' ? 'Pasajero' : locale === 'pt' ? 'Passageiro' : 'Passenger'}{(watchedValues.passengers || 1) !== 1 ? (locale === 'es' ? 's' : locale === 'pt' ? 's' : 's') : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = watchedValues.passengers || 1;
                      const newValue = Math.min(current + 1, 50);
                      setValue('passengers', newValue, { shouldValidate: true });
                    }}
                    disabled={watchedValues.passengers >= 50}
                    className="w-8 h-8 rounded-full bg-white border-2 border-accent-blue text-accent-blue font-bold text-sm hover:bg-accent-blue hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-1"
                  >
                    +
                  </button>
                </div>
                {errors.passengers && (
                  <p className="mt-1 text-sm text-red-600">{errors.passengers.message}</p>
                )}
              </div>

            </div>
          )}

          {/* Step 3: Service & Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Baggage Section */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-navy-primary">
                  {locale === 'es' ? 'Equipaje' : locale === 'pt' ? 'Bagagem' : 'Baggage'}
                </h4>

                <div className="space-y-4">
                  {/* Carry-on Bags */}
                  <div>
                    <label className="block text-sm font-medium text-navy-primary mb-2">
                      {content.carryOnBags}
                    </label>
                    <div className="flex items-center justify-center space-x-4 bg-blue-50 rounded-lg p-4">
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.lightBaggage || 0;
                          const newValue = Math.max(current - 1, 0);
                          setValue('lightBaggage', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.lightBaggage <= 0}
                        className="w-10 h-10 rounded-full bg-white border-2 border-blue-500 text-blue-500 font-bold text-lg hover:bg-blue-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <div className="min-w-[100px] text-center">
                        <div className="text-xl font-bold text-navy-primary">
                          {watchedValues.lightBaggage || 0}
                        </div>
                        <div className="text-xs text-gray-600">
                          {locale === 'es' ? 'Piezas' : locale === 'pt' ? 'Peças' : 'Pieces'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.lightBaggage || 0;
                          const newValue = Math.min(current + 1, 10);
                          setValue('lightBaggage', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.lightBaggage >= 10}
                        className="w-10 h-10 rounded-full bg-white border-2 border-blue-500 text-blue-500 font-bold text-lg hover:bg-blue-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    {errors.lightBaggage && (
                      <p className="mt-1 text-sm text-red-600">{errors.lightBaggage.message}</p>
                    )}
                  </div>

                  {/* Checked Bags */}
                  <div>
                    <label className="block text-sm font-medium text-navy-primary mb-2">
                      {content.checkedBags}
                    </label>
                    <div className="flex items-center justify-center space-x-4 bg-green-50 rounded-lg p-4">
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.mediumBaggage || 0;
                          const newValue = Math.max(current - 1, 0);
                          setValue('mediumBaggage', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.mediumBaggage <= 0}
                        className="w-10 h-10 rounded-full bg-white border-2 border-green-500 text-green-500 font-bold text-lg hover:bg-green-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <div className="min-w-[100px] text-center">
                        <div className="text-xl font-bold text-navy-primary">
                          {watchedValues.mediumBaggage || 0}
                        </div>
                        <div className="text-xs text-gray-600">
                          {locale === 'es' ? 'Piezas' : locale === 'pt' ? 'Peças' : 'Pieces'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.mediumBaggage || 0;
                          const newValue = Math.min(current + 1, 20);
                          setValue('mediumBaggage', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.mediumBaggage >= 20}
                        className="w-10 h-10 rounded-full bg-white border-2 border-green-500 text-green-500 font-bold text-lg hover:bg-green-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    {errors.mediumBaggage && (
                      <p className="mt-1 text-sm text-red-600">{errors.mediumBaggage.message}</p>
                    )}
                  </div>

                  {/* Oversized/Special Bags */}
                  <div>
                    <label className="block text-sm font-medium text-navy-primary mb-2">
                      {content.oversizedBags}
                    </label>
                    <div className="flex items-center justify-center space-x-4 bg-orange-50 rounded-lg p-4">
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.largeBaggage || 0;
                          const newValue = Math.max(current - 1, 0);
                          setValue('largeBaggage', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.largeBaggage <= 0}
                        className="w-10 h-10 rounded-full bg-white border-2 border-orange-500 text-orange-500 font-bold text-lg hover:bg-orange-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <div className="min-w-[100px] text-center">
                        <div className="text-xl font-bold text-navy-primary">
                          {watchedValues.largeBaggage || 0}
                        </div>
                        <div className="text-xs text-gray-600">
                          {locale === 'es' ? 'Piezas' : locale === 'pt' ? 'Peças' : 'Pieces'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.largeBaggage || 0;
                          const newValue = Math.min(current + 1, 10);
                          setValue('largeBaggage', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.largeBaggage >= 10}
                        className="w-10 h-10 rounded-full bg-white border-2 border-orange-500 text-orange-500 font-bold text-lg hover:bg-orange-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    {errors.largeBaggage && (
                      <p className="mt-1 text-sm text-red-600">{errors.largeBaggage.message}</p>
                    )}
                  </div>
                </div>

                {/* Special Items */}
                <FormField
                  label={content.specialItems}
                  error={errors.specialItems?.message}
                >
                  <textarea
                    {...register('specialItems')}
                    rows={3}
                    placeholder={locale === 'es' ? 'Describa equipaje de gran tamaño o artículos especiales...' :
                                locale === 'pt' ? 'Descreva bagagem de grande porte ou itens especiais...' :
                                'Describe oversized baggage or special items...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                  />
                </FormField>
              </div>

              {/* Pets Section */}
              <div className="space-y-4">
                <h4 className="text-base font-medium text-navy-primary">
                  {locale === 'es' ? 'Mascotas' : locale === 'pt' ? 'Animais de Estimação' : 'Pets'}
                </h4>

                {/* Travel with pets toggle */}
                <FormField
                  label={content.pets}
                  error={errors.pets?.message}
                >
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pets"
                        checked={watchedValues.pets === true}
                        onChange={() => setValue('pets', true, { shouldValidate: true })}
                        className="w-4 h-4 text-accent-blue border-gray-300 focus:ring-2 focus:ring-accent-blue"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {locale === 'es' ? 'Sí' : locale === 'pt' ? 'Sim' : 'Yes'}
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pets"
                        checked={watchedValues.pets === false}
                        onChange={() => setValue('pets', false, { shouldValidate: true })}
                        className="w-4 h-4 text-accent-blue border-gray-300 focus:ring-2 focus:ring-accent-blue"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {locale === 'es' ? 'No' : locale === 'pt' ? 'Não' : 'No'}
                      </span>
                    </label>
                  </div>
                </FormField>

                {/* Pet details - only show if pets is true */}
                {watchedValues.pets && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pet Species */}
                      <FormField
                        label={content.petSpecies}
                        error={errors.petSpecies?.message}
                      >
                        <select
                          {...register('petSpecies')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        >
                          <option value="">
                            {locale === 'es' ? 'Seleccionar tipo' : locale === 'pt' ? 'Selecionar tipo' : 'Select type'}
                          </option>
                          {getPetSpeciesOptions(locale).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      {/* Pet Size */}
                      <FormField
                        label={content.petSize}
                        error={errors.petSize?.message}
                      >
                        <select
                          {...register('petSize')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        >
                          <option value="">
                            {locale === 'es' ? 'Seleccionar tamaño' : locale === 'pt' ? 'Selecionar tamanho' : 'Select size'}
                          </option>
                          {getPetSizeOptions(locale).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    {/* Pet Documentation */}
                    <div className="flex items-start space-x-3">
                      <input
                        {...register('petDocumentation')}
                        type="checkbox"
                        className="w-4 h-4 text-accent-blue border-gray-300 rounded focus:ring-2 focus:ring-accent-blue mt-0.5"
                      />
                      <label className="text-sm text-gray-700 cursor-pointer" onClick={() => {
                        setValue('petDocumentation', !watchedValues.petDocumentation, { shouldValidate: true });
                      }}>
                        {content.petDocumentation}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-navy-primary">{content.message}</h4>
                <textarea
                  {...register('message')}
                  rows={6}
                  placeholder={locale === 'es' ? 'Escriba aquí cualquier comentario adicional o solicitud especial...' :
                              locale === 'pt' ? 'Escreva aqui quaisquer comentários adicionais ou solicitações especiais...' :
                              'Write any additional comments or special requests here...'}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none min-h-[120px]"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              {/* Additional Services */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-navy-primary">{content.additionalServices}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getAdditionalServicesOptions(locale).map((service) => (
                    <label
                      key={service.value}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        value={service.value}
                        checked={selectedServices.includes(service.value)}
                        onChange={(e) => {
                          const newServices = e.target.checked
                            ? [...selectedServices, service.value]
                            : selectedServices.filter(s => s !== service.value);
                          setSelectedServices(newServices);
                          setValue('additionalServices', newServices);
                        }}
                        className="w-4 h-4 text-accent-blue border-gray-300 rounded focus:ring-2 focus:ring-accent-blue"
                      />
                      <span className="text-sm font-medium text-navy-primary">
                        {service.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>


              {/* Privacy Consent */}
              <div className="space-y-2">
                <label className="flex items-start space-x-2">
                  <input
                    {...register('privacyConsent')}
                    type="checkbox"
                    className="w-3 h-3 text-accent-blue border-gray-300 rounded focus:ring-1 focus:ring-accent-blue mt-0.5 flex-shrink-0"
                    required
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                    {content.privacyConsent} <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="text-sm text-red-600">{errors.privacyConsent.message}</p>
                )}
              </div>

              {/* reCAPTCHA Mock */}
              <div className={clsx(
                "p-6 border-2 rounded-lg text-center transition-all duration-200",
                recaptchaToken
                  ? "border-green-500 bg-green-50"
                  : "border-orange-400 bg-orange-50 animate-pulse"
              )}>
                {!recaptchaToken ? (
                  <>
                    <div className="flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-orange-800 font-semibold text-lg">
                        {locale === 'es' ? 'Verificación Requerida' :
                         locale === 'pt' ? 'Verificação Necessária' :
                         'Verification Required'}
                      </span>
                    </div>
                    <p className="text-orange-700 mb-4">
                      {locale === 'es' ? 'Por favor complete la verificación para continuar' :
                       locale === 'pt' ? 'Por favor complete a verificação para continuar' :
                       'Please complete the verification to continue'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRecaptchaToken('mock-token-' + Date.now())}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {locale === 'es' ? 'Verificar Ahora' :
                         locale === 'pt' ? 'Verificar Agora' :
                         'Verify Now'}
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-semibold text-lg">
                      {locale === 'es' ? '✓ Verificado correctamente' :
                       locale === 'pt' ? '✓ Verificado com sucesso' :
                       '✓ Verified successfully'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={clsx(
                'border-2 border-gray-600 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-700 hover:text-black px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue',
                currentStep === 1 && 'invisible'
              )}
            >
              {content.prevButton}
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isCurrentStepValid()}
                className={clsx(
                  !isCurrentStepValid()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-accent-blue hover:bg-accent-blue/90'
                )}
              >
                {content.nextButton}
              </Button>
            ) : (
              <div className="relative group">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isCurrentStepValid() || !recaptchaToken}
                  loading={isSubmitting}
                  className={clsx(
                    (!isCurrentStepValid() || !recaptchaToken)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-accent-blue hover:bg-accent-blue/90'
                  )}
                >
                  {content.submitButton}
                </Button>
                {/* Tooltip when disabled due to missing verification */}
                {!recaptchaToken && isCurrentStepValid() && !isSubmitting && (
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {locale === 'es' ? 'Complete la verificación primero' :
                     locale === 'pt' ? 'Complete a verificação primeiro' :
                     'Complete verification first'}
                    <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">Quote Request Submitted</h3>
              <p className="text-green-700 mt-1">We'll get back to you within 24 hours.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800">Submission Failed</h3>
              <p className="text-red-700 mt-1">Please check your information and try again.</p>
            </div>
          )}
        </fieldset>
      </form>

      {/* Live Region for Announcements */}
      <LiveRegion
        message={announcement}
        priority="polite"
        clearAfter={5000}
        onMessageCleared={() => setAnnouncement('')}
      />
    </div>
  );
}