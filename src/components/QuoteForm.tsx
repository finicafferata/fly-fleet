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

// Complete country codes list with flags and unique ISO codes
const allCountryCodes = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫', iso: 'AF' },
  { code: '+355', country: 'Albania', flag: '🇦🇱', iso: 'AL' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', iso: 'DZ' },
  { code: '+1684', country: 'American Samoa', flag: '🇦🇸', iso: 'AS' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩', iso: 'AD' },
  { code: '+244', country: 'Angola', flag: '🇦🇴', iso: 'AO' },
  { code: '+1264', country: 'Anguilla', flag: '🇦🇮', iso: 'AI' },
  { code: '+1268', country: 'Antigua and Barbuda', flag: '🇦🇬', iso: 'AG' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'AR' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', iso: 'AM' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼', iso: 'AW' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', iso: 'AT' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', iso: 'AZ' },
  { code: '+1242', country: 'Bahamas', flag: '🇧🇸', iso: 'BS' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '+1246', country: 'Barbados', flag: '🇧🇧', iso: 'BB' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾', iso: 'BY' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', iso: 'BE' },
  { code: '+501', country: 'Belize', flag: '🇧🇿', iso: 'BZ' },
  { code: '+229', country: 'Benin', flag: '🇧🇯', iso: 'BJ' },
  { code: '+1441', country: 'Bermuda', flag: '🇧🇲', iso: 'BM' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹', iso: 'BT' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'BO' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', iso: 'BA' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼', iso: 'BW' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳', iso: 'BN' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬', iso: 'BG' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', iso: 'BF' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮', iso: 'BI' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭', iso: 'KH' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲', iso: 'CM' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', iso: 'CA' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻', iso: 'CV' },
  { code: '+1345', country: 'Cayman Islands', flag: '🇰🇾', iso: 'KY' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫', iso: 'CF' },
  { code: '+235', country: 'Chad', flag: '🇹🇩', iso: 'TD' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'CL' },
  { code: '+86', country: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'CO' },
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
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', iso: 'CZ' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯', iso: 'DJ' },
  { code: '+1767', country: 'Dominica', flag: '🇩🇲', iso: 'DM' },
  { code: '+1809', country: 'Dominican Republic', flag: '🇩🇴', iso: 'DO' },
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
  { code: '+358', country: 'Finland', flag: '🇫🇮', iso: 'FI' },
  { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫', iso: 'GF' },
  { code: '+689', country: 'French Polynesia', flag: '🇵🇫', iso: 'PF' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦', iso: 'GA' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲', iso: 'GM' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', iso: 'GE' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', iso: 'GH' },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮', iso: 'GI' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', iso: 'GR' },
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
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', iso: 'IR' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶', iso: 'IQ' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
  { code: '+44', country: 'Isle of Man', flag: '🇮🇲', iso: 'IM' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', iso: 'IL' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
  { code: '+1876', country: 'Jamaica', flag: '🇯🇲', iso: 'JM' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
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
  { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX' },
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
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
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
  { code: '+507', country: 'Panama', flag: '🇵🇦', iso: 'PA' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', iso: 'PG' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'PY' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', iso: 'PE' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', iso: 'PL' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', iso: 'PT' },
  { code: '+1787', country: 'Puerto Rico', flag: '🇵🇷', iso: 'PR' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+262', country: 'Réunion', flag: '🇷🇪', iso: 'RE' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', iso: 'RO' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', iso: 'RU' },
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
  { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩', iso: 'SD' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷', iso: 'SR' },
  { code: '+47', country: 'Svalbard and Jan Mayen', flag: '🇸🇯', iso: 'SJ' },
  { code: '+268', country: 'Swaziland', flag: '🇸🇿', iso: 'SZ' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
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
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
  { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾', iso: 'UY' },
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

// Function to get ordered country codes with priority countries first
const getOrderedCountryCodes = () => {
  // Priority countries in the specified order
  const priorityIsos = ['AR', 'BR', 'UY', 'CL', 'PA', 'US', 'CO', 'MX'];

  // Find priority countries
  const priorityCountries = priorityIsos.map(iso =>
    allCountryCodes.find(country => country.iso === iso)
  ).filter(Boolean);

  // Get remaining countries (exclude priority countries)
  const remainingCountries = allCountryCodes.filter(
    country => !priorityIsos.includes(country.iso)
  ).sort((a, b) => a.country.localeCompare(b.country));

  // Create separator object
  const separator = {
    code: '',
    country: '─────────────────',
    flag: '',
    iso: 'SEPARATOR',
    isSeparator: true
  };

  // Combine: priority countries + separator + alphabetical remaining countries
  return [...priorityCountries, separator, ...remainingCountries];
};

// Get the ordered country codes
const countryCodes = getOrderedCountryCodes();

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
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  contactWhatsApp: z.boolean().optional(),
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
    (val) => !val || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
    'Invalid time format. Use HH:MM (e.g., 14:30)'
  ),
  passengers: z.number().min(1, 'At least 1 passenger required').max(50, 'Maximum 50 passengers'),
});

const step3Schema = z.object({
  baggageSize: z.enum(['light', 'medium', 'large']).optional(),
  baggagePieces: z.number().min(0).max(20).default(0),
  specialItems: z.string().optional(),
  pets: z.boolean().default(false),
  petSpecies: z.string().optional(),
  petSize: z.string().optional(),
  petDocumentation: z.boolean().default(false),
  additionalServices: z.array(z.string()).optional(),
  message: z.string().optional(),
  privacyConsent: z.boolean().refine(val => val === true, 'Privacy consent is required'),
});

const fullFormSchema = step1Schema.merge(step2Schema).merge(step3Schema).extend({
  recaptchaToken: z.string().min(1, 'Please complete the verification')
});

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
    value: 'small',
    label: locale === 'es' ? 'Pequeño' : locale === 'pt' ? 'Pequeno' : 'Small'
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

const additionalServicesOptions = [
  { value: 'ground_transport', label: 'Ground Transportation' },
  { value: 'catering', label: 'In-flight Catering' },
  { value: 'wifi', label: 'Wi-Fi Access' },
  { value: 'concierge', label: 'Concierge Services' },
  { value: 'customs', label: 'Customs Assistance' }
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
      baggageSize: 'Baggage Size',
      baggagePieces: 'Number of Pieces',
      specialItems: 'Special Items',
      pets: 'Travel with pets?',
      petSpecies: 'Pet Type/Species',
      petSize: 'Pet Size',
      petDocumentation: 'I have required pet travel documents',
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
      passengers: 'Número de Pasajeros',
      baggageSize: 'Tamaño de Equipaje',
      baggagePieces: 'Número de Piezas',
      specialItems: 'Artículos Especiales',
      pets: '¿Viajar con mascotas?',
      petSpecies: 'Tipo/Especie de Mascota',
      petSize: 'Tamaño de Mascota',
      petDocumentation: 'Tengo documentación requerida para viaje de mascotas',
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
      passengers: 'Número de Passageiros',
      baggageSize: 'Tamanho da Bagagem',
      baggagePieces: 'Número de Peças',
      specialItems: 'Itens Especiais',
      pets: 'Viajar com animais de estimação?',
      petSpecies: 'Tipo/Espécie do Animal',
      petSize: 'Tamanho do Animal',
      petDocumentation: 'Tenho documentação necessária para viagem de animais',
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
  const { announce, announceAssertive } = useAnnouncer();
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
      baggagePieces: 0,
      pets: false,
      privacyConsent: false,
      contactWhatsApp: false,
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
    if (!recaptchaToken) {
      announceAssertive('Please complete the verification before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setAnnouncement('Submitting quote request...');

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
          locale
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

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
      announceAssertive(errorMessage);
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [recaptchaToken, locale, reset, announce, announceAssertive, onSubmitSuccess, onSubmitError]);

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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting}>
          <legend className="sr-only">Quote Request Form - Step {currentStep}</legend>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                      <option key={country.iso} value={country.code}>
                        {country.flag} {country.code}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue cursor-pointer"
                    required
                    style={{
                      colorScheme: 'light',
                      position: 'relative'
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
                  <div className="relative">
                    <input
                      {...register('departureTime')}
                      type="text"
                      placeholder="HH:MM or select"
                      pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        let value = target.value.replace(/[^0-9:]/g, '');
                        if (value.length === 2 && !value.includes(':')) {
                          value = value + ':';
                        }
                        if (value.length > 5) {
                          value = value.slice(0, 5);
                        }
                        target.value = value;
                        setValue('departureTime', value);
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setValue('departureTime', e.target.value);
                          }
                        }}
                        className="h-full py-0 pl-2 pr-7 border-0 bg-transparent text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue rounded-r-lg"
                        value=""
                      >
                        <option value="">⏰</option>
                        {timeOptions.map((time) => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.departureTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.departureTime.message}</p>
                  )}
                </div>
              </div>

              {/* Number of Passengers */}
              <div className="mt-6">
                <FormField
                  label={content.passengers}
                  required
                  error={errors.passengers?.message}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        const current = watchedValues.passengers || 1;
                        const newValue = Math.max(current - 1, 1);
                        setValue('passengers', newValue, { shouldValidate: true });
                      }}
                      disabled={watchedValues.passengers <= 1}
                      className="w-10 h-10 rounded-full border-2 border-accent-blue flex items-center justify-center disabled:opacity-50"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center font-medium text-lg py-2 px-4 border rounded-md">
                      {watchedValues.passengers || 1} Passenger{(watchedValues.passengers || 1) !== 1 ? 's' : ''}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = watchedValues.passengers || 1;
                        const newValue = Math.min(current + 1, 50);
                        setValue('passengers', newValue, { shouldValidate: true });
                      }}
                      disabled={watchedValues.passengers >= 50}
                      className="w-10 h-10 rounded-full border-2 border-accent-blue flex items-center justify-center disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </FormField>
              </div>

            </div>
          )}

          {/* Step 3: Service & Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Baggage Section */}
              <div className="space-y-4">
                <h4 className="text-base font-medium text-navy-primary">
                  {locale === 'es' ? 'Equipaje' : locale === 'pt' ? 'Bagagem' : 'Baggage'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Baggage Size */}
                  <FormField
                    label={content.baggageSize}
                    error={errors.baggageSize?.message}
                  >
                    <div className="space-y-3">
                      {getBaggageSizeOptions(locale).map((option) => (
                        <label
                          key={option.value}
                          className={clsx(
                            'flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all',
                            'hover:border-blue-300 hover:bg-blue-50',
                            watchedValues.baggageSize === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300'
                          )}
                        >
                          <input
                            {...register('baggageSize')}
                            type="radio"
                            value={option.value}
                            className="sr-only"
                          />
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FormField>

                  {/* Number of Pieces */}
                  <FormField
                    label={content.baggagePieces}
                    error={errors.baggagePieces?.message}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.baggagePieces || 0;
                          const newValue = Math.max(current - 1, 0);
                          setValue('baggagePieces', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.baggagePieces <= 0}
                        className="w-10 h-10 rounded-full border-2 border-accent-blue flex items-center justify-center disabled:opacity-50"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center font-medium text-lg py-2 px-4 border rounded-md">
                        {watchedValues.baggagePieces || 0}
                        {locale === 'es' ? ' Piezas' : locale === 'pt' ? ' Peças' : ' Pieces'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = watchedValues.baggagePieces || 0;
                          const newValue = Math.min(current + 1, 20);
                          setValue('baggagePieces', newValue, { shouldValidate: true });
                        }}
                        disabled={watchedValues.baggagePieces >= 20}
                        className="w-10 h-10 rounded-full border-2 border-accent-blue flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </FormField>
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
                        {...register('pets')}
                        type="radio"
                        value="true"
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
                        {...register('pets')}
                        type="radio"
                        value="false"
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
              <FormField
                label={content.message}
                error={errors.message?.message}
              >
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder={locale === 'es' ? 'Escriba aquí cualquier comentario adicional o solicitud especial...' :
                              locale === 'pt' ? 'Escreva aqui quaisquer comentários adicionais ou solicitações especiais...' :
                              'Write any additional comments or special requests here...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                />
              </FormField>

              {/* Additional Services */}
              <div className="space-y-4">
                <h4 className="text-base font-medium text-navy-primary">Additional Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {additionalServicesOptions.map((service) => (
                    <label
                      key={service.value}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
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

              {/* Pet Section */}
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    {...register('pets')}
                    type="checkbox"
                    className="w-4 h-4 text-accent-blue border-gray-300 rounded focus:ring-2 focus:ring-accent-blue"
                  />
                  <span className="text-sm font-medium text-navy-primary">
                    {content.pets}
                  </span>
                </label>

                {showPetSection && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        {...register('petSpecies')}
                        label="Species/Type"
                        placeholder="Dog, cat, bird, etc."
                      />
                      <Select
                        options={[
                          { value: 'small', label: 'Small (under 20 lbs)' },
                          { value: 'medium', label: 'Medium (20-60 lbs)' },
                          { value: 'large', label: 'Large (over 60 lbs)' }
                        ]}
                        value={watchedValues.petSize || ''}
                        onChange={(value) => setValue('petSize', value)}
                        label="Size"
                        placeholder="Select pet size"
                      />
                    </div>
                  </div>
                )}
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
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-gray-600 mb-2">reCAPTCHA component will be integrated here</p>
                <button
                  type="button"
                  onClick={() => setRecaptchaToken('mock-token-' + Date.now())}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mock Verify
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className={clsx(
                'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-6 py-2 rounded-lg font-medium transition-colors duration-200',
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